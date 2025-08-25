import tkinter as tk
from tkinter import ttk, messagebox, scrolledtext, filedialog
import os
import datetime
import json
import sqlite3
from pathlib import Path
import email
from email import policy
from email.parser import BytesParser
import chardet
import re
import base64
import quopri
from html.parser import HTMLParser
import zipfile
import shutil


class HTMLToText(HTMLParser):
    def __init__(self):
        super().__init__()
        self.text = []
        self.hide_output = False
        
    def handle_starttag(self, tag, attrs):
        if tag in ('script', 'style'):
            self.hide_output = True
            
    def handle_endtag(self, tag):
        if tag in ('script', 'style'):
            self.hide_output = False
        elif tag in ('p', 'br', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'):
            self.text.append('\n')
            
    def handle_data(self, data):
        if not self.hide_output:
            self.text.append(data)
            
    def get_text(self):
        return ''.join(self.text)


class MailBackupManager:
    def __init__(self, root):
        self.root = root
        self.root.title("메일 백업 관리자")
        self.root.geometry("1300x750")
        
        self.db_path = "mail_backup.db"
        self.attachments_dir = "attachments"
        self.init_database()
        self.init_directories()
        
        self.current_filter = {}
        self.setup_ui()
        self.load_mails_from_db()
        
    def init_directories(self):
        if not os.path.exists(self.attachments_dir):
            os.makedirs(self.attachments_dir)
    
    def init_database(self):
        self.conn = sqlite3.connect(self.db_path)
        self.cursor = self.conn.cursor()
        
        self.cursor.execute('''
            CREATE TABLE IF NOT EXISTS mails (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                subject TEXT,
                sender TEXT,
                sender_name TEXT,
                recipients TEXT,
                cc TEXT,
                bcc TEXT,
                date TEXT,
                body_text TEXT,
                body_html TEXT,
                headers TEXT,
                attachments TEXT,
                tags TEXT,
                folder TEXT,
                importance INTEGER DEFAULT 0,
                read_status INTEGER DEFAULT 0,
                file_path TEXT,
                import_date TEXT,
                message_id TEXT UNIQUE,
                in_reply_to TEXT,
                mail_references TEXT
            )
        ''')
        
        self.cursor.execute('''
            CREATE INDEX IF NOT EXISTS idx_date ON mails(date)
        ''')
        self.cursor.execute('''
            CREATE INDEX IF NOT EXISTS idx_sender ON mails(sender)
        ''')
        self.cursor.execute('''
            CREATE INDEX IF NOT EXISTS idx_subject ON mails(subject)
        ''')
        
        self.conn.commit()
    
    def setup_ui(self):
        menubar = tk.Menu(self.root)
        self.root.config(menu=menubar)
        
        file_menu = tk.Menu(menubar, tearoff=0)
        menubar.add_cascade(label="파일", menu=file_menu)
        file_menu.add_command(label="메일 가져오기 (EML/MSG)", command=self.import_mails)
        file_menu.add_command(label="폴더 가져오기", command=self.import_folder)
        file_menu.add_separator()
        file_menu.add_command(label="백업 생성", command=self.create_backup)
        file_menu.add_command(label="백업 복원", command=self.restore_backup)
        file_menu.add_separator()
        file_menu.add_command(label="내보내기", command=self.export_selected)
        file_menu.add_separator()
        file_menu.add_command(label="종료", command=self.close_app)
        
        edit_menu = tk.Menu(menubar, tearoff=0)
        menubar.add_cascade(label="편집", menu=edit_menu)
        edit_menu.add_command(label="선택 삭제", command=self.delete_selected)
        edit_menu.add_command(label="모두 선택", command=self.select_all)
        edit_menu.add_command(label="선택 해제", command=self.deselect_all)
        
        toolbar = ttk.Frame(self.root)
        toolbar.pack(side=tk.TOP, fill=tk.X, padx=5, pady=5)
        
        ttk.Button(toolbar, text="📥 메일 가져오기", command=self.import_mails).pack(side=tk.LEFT, padx=2)
        ttk.Button(toolbar, text="📁 폴더 가져오기", command=self.import_folder).pack(side=tk.LEFT, padx=2)
        ttk.Separator(toolbar, orient=tk.VERTICAL).pack(side=tk.LEFT, fill=tk.Y, padx=5)
        
        ttk.Label(toolbar, text="검색:").pack(side=tk.LEFT, padx=5)
        self.search_var = tk.StringVar()
        self.search_entry = ttk.Entry(toolbar, textvariable=self.search_var, width=30)
        self.search_entry.pack(side=tk.LEFT, padx=5)
        self.search_entry.bind('<Return>', lambda e: self.search_mails())
        
        self.search_option = tk.StringVar(value="all")
        search_menu = ttk.OptionMenu(toolbar, self.search_option, "all", "all", "subject", "sender", "body")
        search_menu.pack(side=tk.LEFT, padx=2)
        
        ttk.Button(toolbar, text="🔍 검색", command=self.search_mails).pack(side=tk.LEFT, padx=2)
        ttk.Button(toolbar, text="❌ 초기화", command=self.clear_search).pack(side=tk.LEFT, padx=2)
        
        ttk.Separator(toolbar, orient=tk.VERTICAL).pack(side=tk.LEFT, fill=tk.Y, padx=5)
        
        ttk.Label(toolbar, text="기간:").pack(side=tk.LEFT, padx=5)
        self.date_filter = tk.StringVar(value="all")
        date_menu = ttk.OptionMenu(toolbar, self.date_filter, "all", "all", "today", "week", "month", "year")
        date_menu.pack(side=tk.LEFT, padx=2)
        self.date_filter.trace('w', lambda *args: self.apply_filters())
        
        main_frame = ttk.PanedWindow(self.root, orient=tk.HORIZONTAL)
        main_frame.pack(fill=tk.BOTH, expand=True, padx=5, pady=5)
        
        left_frame = ttk.Frame(main_frame)
        main_frame.add(left_frame, weight=3)
        
        list_header = ttk.Frame(left_frame)
        list_header.pack(fill=tk.X)
        ttk.Label(list_header, text="메일 목록", font=('Arial', 10, 'bold')).pack(side=tk.LEFT)
        self.mail_count_label = ttk.Label(list_header, text="(0개)")
        self.mail_count_label.pack(side=tk.LEFT, padx=10)
        
        list_frame = ttk.Frame(left_frame)
        list_frame.pack(fill=tk.BOTH, expand=True, pady=5)
        
        columns = ('Select', 'Date', 'From', 'Subject', 'Size', 'Attachments', 'Tags')
        self.mail_tree = ttk.Treeview(list_frame, columns=columns, show='tree headings', selectmode='extended')
        
        self.mail_tree.heading('#0', text='ID')
        self.mail_tree.heading('Select', text='✓')
        self.mail_tree.heading('Date', text='날짜')
        self.mail_tree.heading('From', text='보낸사람')
        self.mail_tree.heading('Subject', text='제목')
        self.mail_tree.heading('Size', text='크기')
        self.mail_tree.heading('Attachments', text='첨부')
        self.mail_tree.heading('Tags', text='태그')
        
        self.mail_tree.column('#0', width=50)
        self.mail_tree.column('Select', width=30)
        self.mail_tree.column('Date', width=150)
        self.mail_tree.column('From', width=150)
        self.mail_tree.column('Subject', width=300)
        self.mail_tree.column('Size', width=80)
        self.mail_tree.column('Attachments', width=60)
        self.mail_tree.column('Tags', width=100)
        
        scrollbar_y = ttk.Scrollbar(list_frame, orient=tk.VERTICAL, command=self.mail_tree.yview)
        scrollbar_x = ttk.Scrollbar(list_frame, orient=tk.HORIZONTAL, command=self.mail_tree.xview)
        self.mail_tree.configure(yscrollcommand=scrollbar_y.set, xscrollcommand=scrollbar_x.set)
        
        self.mail_tree.grid(row=0, column=0, sticky='nsew')
        scrollbar_y.grid(row=0, column=1, sticky='ns')
        scrollbar_x.grid(row=1, column=0, sticky='ew')
        
        list_frame.grid_rowconfigure(0, weight=1)
        list_frame.grid_columnconfigure(0, weight=1)
        
        self.mail_tree.bind('<<TreeviewSelect>>', self.on_mail_select)
        self.mail_tree.bind('<Button-3>', self.show_context_menu)
        self.mail_tree.bind('<Double-1>', self.toggle_selection)
        
        right_frame = ttk.Frame(main_frame)
        main_frame.add(right_frame, weight=2)
        
        ttk.Label(right_frame, text="메일 내용", font=('Arial', 10, 'bold')).pack(anchor=tk.W)
        
        info_frame = ttk.LabelFrame(right_frame, text="메일 정보")
        info_frame.pack(fill=tk.X, pady=5)
        
        self.info_labels = {}
        fields = [
            ('보낸사람', 'sender'),
            ('받는사람', 'recipients'),
            ('참조', 'cc'),
            ('날짜', 'date'),
            ('제목', 'subject')
        ]
        
        for label, key in fields:
            frame = ttk.Frame(info_frame)
            frame.pack(fill=tk.X, pady=2, padx=5)
            ttk.Label(frame, text=f"{label}:", width=10).pack(side=tk.LEFT)
            self.info_labels[key] = ttk.Label(frame, text="", relief=tk.SUNKEN)
            self.info_labels[key].pack(side=tk.LEFT, fill=tk.X, expand=True, padx=5)
        
        tag_frame = ttk.Frame(right_frame)
        tag_frame.pack(fill=tk.X, pady=5)
        ttk.Label(tag_frame, text="태그:").pack(side=tk.LEFT)
        self.tag_entry = ttk.Entry(tag_frame, width=20)
        self.tag_entry.pack(side=tk.LEFT, padx=5)
        ttk.Button(tag_frame, text="태그 추가", command=self.add_tag).pack(side=tk.LEFT)
        self.current_tags_label = ttk.Label(tag_frame, text="")
        self.current_tags_label.pack(side=tk.LEFT, padx=10)
        
        content_notebook = ttk.Notebook(right_frame)
        content_notebook.pack(fill=tk.BOTH, expand=True, pady=5)
        
        text_frame = ttk.Frame(content_notebook)
        content_notebook.add(text_frame, text="텍스트")
        self.content_text = scrolledtext.ScrolledText(text_frame, wrap=tk.WORD)
        self.content_text.pack(fill=tk.BOTH, expand=True)
        
        html_frame = ttk.Frame(content_notebook)
        content_notebook.add(html_frame, text="HTML")
        self.html_text = scrolledtext.ScrolledText(html_frame, wrap=tk.WORD)
        self.html_text.pack(fill=tk.BOTH, expand=True)
        
        attachments_frame = ttk.Frame(content_notebook)
        content_notebook.add(attachments_frame, text="첨부파일")
        
        self.attachments_listbox = tk.Listbox(attachments_frame)
        self.attachments_listbox.pack(fill=tk.BOTH, expand=True, padx=5, pady=5)
        
        att_button_frame = ttk.Frame(attachments_frame)
        att_button_frame.pack(fill=tk.X)
        ttk.Button(att_button_frame, text="첨부파일 저장", command=self.save_attachment).pack(side=tk.LEFT, padx=5)
        ttk.Button(att_button_frame, text="모두 저장", command=self.save_all_attachments).pack(side=tk.LEFT, padx=5)
        
        status_bar = ttk.Frame(self.root)
        status_bar.pack(side=tk.BOTTOM, fill=tk.X)
        self.status_label = ttk.Label(status_bar, text="준비", relief=tk.SUNKEN)
        self.status_label.pack(side=tk.LEFT, fill=tk.X, expand=True)
        
        self.context_menu = tk.Menu(self.root, tearoff=0)
        self.context_menu.add_command(label="태그 편집", command=self.edit_tag)
        self.context_menu.add_command(label="중요 표시", command=self.mark_important)
        self.context_menu.add_separator()
        self.context_menu.add_command(label="선택 항목 내보내기", command=self.export_selected)
        self.context_menu.add_command(label="삭제", command=self.delete_selected)
        
        self.selected_items = set()
    
    def import_mails(self):
        files = filedialog.askopenfilenames(
            title="메일 파일 선택",
            filetypes=[("Email files", "*.eml *.msg"), ("EML files", "*.eml"), ("MSG files", "*.msg"), ("All files", "*.*")]
        )
        
        if files:
            imported = 0
            failed = 0
            
            progress = tk.Toplevel(self.root)
            progress.title("메일 가져오기 중...")
            progress.geometry("400x100")
            
            ttk.Label(progress, text="메일을 가져오는 중입니다...").pack(pady=10)
            progress_bar = ttk.Progressbar(progress, length=350, mode='determinate')
            progress_bar.pack(pady=10)
            progress_label = ttk.Label(progress, text="0 / 0")
            progress_label.pack()
            
            total = len(files)
            progress_bar['maximum'] = total
            
            for i, file_path in enumerate(files):
                progress_bar['value'] = i + 1
                progress_label.config(text=f"{i+1} / {total}")
                progress.update()
                
                try:
                    if file_path.lower().endswith('.eml'):
                        self.import_eml_file(file_path)
                    elif file_path.lower().endswith('.msg'):
                        self.import_msg_file(file_path)
                    imported += 1
                except Exception as e:
                    print(f"Failed to import {file_path}: {e}")
                    failed += 1
            
            progress.destroy()
            
            self.load_mails_from_db()
            messagebox.showinfo("완료", f"메일 가져오기 완료\n성공: {imported}개\n실패: {failed}개")
    
    def import_folder(self):
        folder = filedialog.askdirectory(title="메일 폴더 선택")
        if folder:
            files = []
            for root, dirs, filenames in os.walk(folder):
                for filename in filenames:
                    if filename.lower().endswith(('.eml', '.msg')):
                        files.append(os.path.join(root, filename))
            
            if files:
                imported = 0
                failed = 0
                
                progress = tk.Toplevel(self.root)
                progress.title("폴더 가져오기 중...")
                progress.geometry("400x100")
                
                ttk.Label(progress, text="메일을 가져오는 중입니다...").pack(pady=10)
                progress_bar = ttk.Progressbar(progress, length=350, mode='determinate')
                progress_bar.pack(pady=10)
                progress_label = ttk.Label(progress, text="0 / 0")
                progress_label.pack()
                
                total = len(files)
                progress_bar['maximum'] = total
                
                for i, file_path in enumerate(files):
                    progress_bar['value'] = i + 1
                    progress_label.config(text=f"{i+1} / {total}")
                    progress.update()
                    
                    try:
                        if file_path.lower().endswith('.eml'):
                            self.import_eml_file(file_path)
                        elif file_path.lower().endswith('.msg'):
                            self.import_msg_file(file_path)
                        imported += 1
                    except Exception as e:
                        print(f"Failed to import {file_path}: {e}")
                        failed += 1
                
                progress.destroy()
                
                self.load_mails_from_db()
                messagebox.showinfo("완료", f"폴더 가져오기 완료\n성공: {imported}개\n실패: {failed}개")
            else:
                messagebox.showinfo("알림", "메일 파일을 찾을 수 없습니다.")
    
    def import_eml_file(self, file_path):
        with open(file_path, 'rb') as f:
            msg = BytesParser(policy=policy.default).parse(f)
        
        subject = msg.get('Subject', '(제목 없음)')
        sender = msg.get('From', '')
        recipients = msg.get('To', '')
        cc = msg.get('Cc', '')
        bcc = msg.get('Bcc', '')
        date_str = msg.get('Date', '')
        message_id = msg.get('Message-ID', '')
        in_reply_to = msg.get('In-Reply-To', '')
        references = msg.get('References', '')
        
        sender_name = self.extract_name_from_email(sender)
        
        body_text = ""
        body_html = ""
        attachments = []
        
        for part in msg.walk():
            content_type = part.get_content_type()
            content_disposition = str(part.get("Content-Disposition", ""))
            
            if "attachment" in content_disposition:
                filename = part.get_filename()
                if filename:
                    attachments.append(filename)
                    attachment_data = part.get_payload(decode=True)
                    if attachment_data:
                        att_path = os.path.join(self.attachments_dir, f"{message_id}_{filename}")
                        with open(att_path, 'wb') as f:
                            f.write(attachment_data)
            elif content_type == "text/plain":
                payload = part.get_payload(decode=True)
                if payload:
                    charset = part.get_content_charset() or 'utf-8'
                    try:
                        body_text = payload.decode(charset, errors='ignore')
                    except:
                        body_text = str(payload)
            elif content_type == "text/html":
                payload = part.get_payload(decode=True)
                if payload:
                    charset = part.get_content_charset() or 'utf-8'
                    try:
                        body_html = payload.decode(charset, errors='ignore')
                    except:
                        body_html = str(payload)
        
        if body_html and not body_text:
            parser = HTMLToText()
            parser.feed(body_html)
            body_text = parser.get_text()
        
        headers = json.dumps(dict(msg.items()))
        attachments_json = json.dumps(attachments)
        
        try:
            self.cursor.execute('''
                INSERT OR REPLACE INTO mails 
                (subject, sender, sender_name, recipients, cc, bcc, date, body_text, body_html, 
                 headers, attachments, file_path, import_date, message_id, in_reply_to, mail_references)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (subject, sender, sender_name, recipients, cc, bcc, date_str, body_text, body_html,
                  headers, attachments_json, file_path, datetime.datetime.now().isoformat(),
                  message_id, in_reply_to, references))
            self.conn.commit()
        except sqlite3.IntegrityError:
            pass
    
    def import_msg_file(self, file_path):
        try:
            import extract_msg
            msg = extract_msg.openMsg(file_path)
            
            subject = msg.subject or '(제목 없음)'
            sender = msg.sender or ''
            sender_name = msg.senderName or self.extract_name_from_email(sender)
            recipients = msg.to or ''
            cc = msg.cc or ''
            bcc = msg.bcc or ''
            date_str = str(msg.date) if msg.date else ''
            body_text = msg.body or ''
            body_html = msg.htmlBody or ''
            
            message_id = msg.messageId or f"msg_{os.path.basename(file_path)}_{datetime.datetime.now().timestamp()}"
            
            attachments = []
            for attachment in msg.attachments:
                if attachment.longFilename:
                    filename = attachment.longFilename
                    attachments.append(filename)
                    att_data = attachment.data
                    if att_data:
                        att_path = os.path.join(self.attachments_dir, f"{message_id}_{filename}")
                        with open(att_path, 'wb') as f:
                            f.write(att_data)
            
            headers = json.dumps({
                'Subject': subject,
                'From': sender,
                'To': recipients,
                'Date': date_str
            })
            attachments_json = json.dumps(attachments)
            
            self.cursor.execute('''
                INSERT OR REPLACE INTO mails 
                (subject, sender, sender_name, recipients, cc, bcc, date, body_text, body_html, 
                 headers, attachments, file_path, import_date, message_id)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (subject, sender, sender_name, recipients, cc, bcc, date_str, body_text, body_html,
                  headers, attachments_json, file_path, datetime.datetime.now().isoformat(), message_id))
            self.conn.commit()
            
            msg.close()
        except ImportError:
            messagebox.showerror("오류", "MSG 파일을 읽으려면 extract-msg 패키지가 필요합니다.\npip install extract-msg")
        except Exception as e:
            raise e
    
    def extract_name_from_email(self, email_str):
        match = re.match(r'^"?([^"<]+)"?\s*<?([^>]+)>?$', email_str.strip())
        if match:
            return match.group(1).strip()
        return email_str.split('@')[0] if '@' in email_str else email_str
    
    def load_mails_from_db(self):
        for item in self.mail_tree.get_children():
            self.mail_tree.delete(item)
        
        query = "SELECT * FROM mails WHERE 1=1"
        params = []
        
        if hasattr(self, 'current_search_term') and self.current_search_term:
            if self.search_option.get() == "all":
                query += " AND (subject LIKE ? OR sender LIKE ? OR body_text LIKE ?)"
                params.extend([f"%{self.current_search_term}%"] * 3)
            elif self.search_option.get() == "subject":
                query += " AND subject LIKE ?"
                params.append(f"%{self.current_search_term}%")
            elif self.search_option.get() == "sender":
                query += " AND (sender LIKE ? OR sender_name LIKE ?)"
                params.extend([f"%{self.current_search_term}%"] * 2)
            elif self.search_option.get() == "body":
                query += " AND body_text LIKE ?"
                params.append(f"%{self.current_search_term}%")
        
        if hasattr(self, 'date_filter') and self.date_filter.get() != "all":
            today = datetime.datetime.now()
            if self.date_filter.get() == "today":
                date_limit = today.strftime('%Y-%m-%d')
                query += " AND date >= ?"
                params.append(date_limit)
            elif self.date_filter.get() == "week":
                date_limit = (today - datetime.timedelta(days=7)).strftime('%Y-%m-%d')
                query += " AND date >= ?"
                params.append(date_limit)
            elif self.date_filter.get() == "month":
                date_limit = (today - datetime.timedelta(days=30)).strftime('%Y-%m-%d')
                query += " AND date >= ?"
                params.append(date_limit)
            elif self.date_filter.get() == "year":
                date_limit = (today - datetime.timedelta(days=365)).strftime('%Y-%m-%d')
                query += " AND date >= ?"
                params.append(date_limit)
        
        query += " ORDER BY date DESC"
        
        self.cursor.execute(query, params)
        mails = self.cursor.fetchall()
        
        for mail in mails:
            mail_id = mail[0]
            subject = mail[1] or '(제목 없음)'
            sender_name = mail[3] or mail[2] or '(알 수 없음)'
            date = mail[7] or ''
            body_text = mail[8] or ''
            attachments = json.loads(mail[11]) if mail[11] else []
            tags = mail[12] if mail[12] else ''
            
            size = len(body_text) // 1024
            size_str = f"{size}KB" if size > 0 else "<1KB"
            att_count = len(attachments)
            att_str = f"📎{att_count}" if att_count > 0 else ""
            
            selected = "✓" if mail_id in self.selected_items else ""
            
            self.mail_tree.insert('', 'end',
                                 text=str(mail_id),
                                 values=(selected, date[:16], sender_name[:30], 
                                        subject[:50], size_str, att_str, tags))
        
        self.mail_count_label.config(text=f"({len(mails)}개)")
        self.status_label.config(text=f"총 {len(mails)}개의 메일")
    
    def on_mail_select(self, event):
        selection = self.mail_tree.selection()
        if selection:
            item = selection[0]
            mail_id = int(self.mail_tree.item(item, 'text'))
            
            self.cursor.execute("SELECT * FROM mails WHERE id = ?", (mail_id,))
            mail = self.cursor.fetchone()
            
            if mail:
                self.info_labels['subject'].config(text=mail[1] or '')
                self.info_labels['sender'].config(text=f"{mail[3]} <{mail[2]}>" if mail[3] else mail[2])
                self.info_labels['recipients'].config(text=mail[4] or '')
                self.info_labels['cc'].config(text=mail[5] or '')
                self.info_labels['date'].config(text=mail[7] or '')
                
                self.content_text.delete(1.0, tk.END)
                self.content_text.insert(1.0, mail[8] or '')
                
                self.html_text.delete(1.0, tk.END)
                self.html_text.insert(1.0, mail[9] or '')
                
                self.attachments_listbox.delete(0, tk.END)
                if mail[11]:
                    attachments = json.loads(mail[11])
                    for att in attachments:
                        self.attachments_listbox.insert(tk.END, att)
                
                tags = mail[12] if mail[12] else ''
                self.current_tags_label.config(text=tags)
    
    def toggle_selection(self, event):
        item = self.mail_tree.identify('item', event.x, event.y)
        if item:
            mail_id = int(self.mail_tree.item(item, 'text'))
            if mail_id in self.selected_items:
                self.selected_items.remove(mail_id)
                values = list(self.mail_tree.item(item, 'values'))
                values[0] = ""
                self.mail_tree.item(item, values=values)
            else:
                self.selected_items.add(mail_id)
                values = list(self.mail_tree.item(item, 'values'))
                values[0] = "✓"
                self.mail_tree.item(item, values=values)
    
    def select_all(self):
        for item in self.mail_tree.get_children():
            mail_id = int(self.mail_tree.item(item, 'text'))
            self.selected_items.add(mail_id)
            values = list(self.mail_tree.item(item, 'values'))
            values[0] = "✓"
            self.mail_tree.item(item, values=values)
    
    def deselect_all(self):
        self.selected_items.clear()
        for item in self.mail_tree.get_children():
            values = list(self.mail_tree.item(item, 'values'))
            values[0] = ""
            self.mail_tree.item(item, values=values)
    
    def search_mails(self):
        self.current_search_term = self.search_var.get()
        self.load_mails_from_db()
    
    def clear_search(self):
        self.search_var.set("")
        self.current_search_term = ""
        self.date_filter.set("all")
        self.load_mails_from_db()
    
    def apply_filters(self):
        self.load_mails_from_db()
    
    def add_tag(self):
        selection = self.mail_tree.selection()
        if selection:
            tag = self.tag_entry.get().strip()
            if tag:
                for item in selection:
                    mail_id = int(self.mail_tree.item(item, 'text'))
                    
                    self.cursor.execute("SELECT tags FROM mails WHERE id = ?", (mail_id,))
                    current_tags = self.cursor.fetchone()[0] or ""
                    
                    tags_list = [t.strip() for t in current_tags.split(',') if t.strip()]
                    if tag not in tags_list:
                        tags_list.append(tag)
                    
                    new_tags = ', '.join(tags_list)
                    self.cursor.execute("UPDATE mails SET tags = ? WHERE id = ?", (new_tags, mail_id))
                
                self.conn.commit()
                self.load_mails_from_db()
                self.tag_entry.delete(0, tk.END)
                messagebox.showinfo("성공", f"태그 '{tag}'가 추가되었습니다.")
    
    def edit_tag(self):
        selection = self.mail_tree.selection()
        if selection and len(selection) == 1:
            item = selection[0]
            mail_id = int(self.mail_tree.item(item, 'text'))
            
            self.cursor.execute("SELECT tags FROM mails WHERE id = ?", (mail_id,))
            current_tags = self.cursor.fetchone()[0] or ""
            
            dialog = tk.Toplevel(self.root)
            dialog.title("태그 편집")
            dialog.geometry("400x150")
            
            ttk.Label(dialog, text="태그 (쉼표로 구분):").pack(pady=10)
            tag_entry = ttk.Entry(dialog, width=50)
            tag_entry.pack(pady=5)
            tag_entry.insert(0, current_tags)
            
            def save_tags():
                new_tags = tag_entry.get()
                self.cursor.execute("UPDATE mails SET tags = ? WHERE id = ?", (new_tags, mail_id))
                self.conn.commit()
                self.load_mails_from_db()
                dialog.destroy()
            
            button_frame = ttk.Frame(dialog)
            button_frame.pack(pady=10)
            ttk.Button(button_frame, text="저장", command=save_tags).pack(side=tk.LEFT, padx=5)
            ttk.Button(button_frame, text="취소", command=dialog.destroy).pack(side=tk.LEFT, padx=5)
    
    def mark_important(self):
        selection = self.mail_tree.selection()
        if selection:
            for item in selection:
                mail_id = int(self.mail_tree.item(item, 'text'))
                self.cursor.execute("UPDATE mails SET importance = 1 WHERE id = ?", (mail_id,))
            self.conn.commit()
            messagebox.showinfo("성공", "중요 표시가 추가되었습니다.")
    
    def delete_selected(self):
        if self.selected_items or self.mail_tree.selection():
            if messagebox.askyesno("확인", "선택한 메일을 삭제하시겠습니까?"):
                to_delete = list(self.selected_items)
                
                for item in self.mail_tree.selection():
                    mail_id = int(self.mail_tree.item(item, 'text'))
                    if mail_id not in to_delete:
                        to_delete.append(mail_id)
                
                for mail_id in to_delete:
                    self.cursor.execute("DELETE FROM mails WHERE id = ?", (mail_id,))
                
                self.conn.commit()
                self.selected_items.clear()
                self.load_mails_from_db()
                messagebox.showinfo("성공", f"{len(to_delete)}개의 메일이 삭제되었습니다.")
    
    def export_selected(self):
        if not self.selected_items and not self.mail_tree.selection():
            messagebox.showwarning("경고", "내보낼 메일을 선택하세요.")
            return
        
        export_dir = filedialog.askdirectory(title="내보낼 폴더 선택")
        if export_dir:
            to_export = list(self.selected_items)
            
            for item in self.mail_tree.selection():
                mail_id = int(self.mail_tree.item(item, 'text'))
                if mail_id not in to_export:
                    to_export.append(mail_id)
            
            exported = 0
            for mail_id in to_export:
                self.cursor.execute("SELECT * FROM mails WHERE id = ?", (mail_id,))
                mail = self.cursor.fetchone()
                if mail:
                    subject = re.sub(r'[<>:"/\\|?*]', '_', mail[1] or 'untitled')
                    filename = f"{mail_id}_{subject[:50]}.eml"
                    file_path = os.path.join(export_dir, filename)
                    
                    with open(file_path, 'w', encoding='utf-8') as f:
                        f.write(f"Subject: {mail[1]}\n")
                        f.write(f"From: {mail[2]}\n")
                        f.write(f"To: {mail[4]}\n")
                        f.write(f"Date: {mail[7]}\n")
                        f.write("\n")
                        f.write(mail[8] or '')
                    
                    exported += 1
            
            messagebox.showinfo("완료", f"{exported}개의 메일이 내보내졌습니다.")
    
    def save_attachment(self):
        selection = self.attachments_listbox.curselection()
        if selection:
            filename = self.attachments_listbox.get(selection[0])
            
            save_path = filedialog.asksaveasfilename(
                defaultextension="",
                initialfile=filename,
                filetypes=[("All files", "*.*")]
            )
            
            if save_path:
                mail_selection = self.mail_tree.selection()
                if mail_selection:
                    item = mail_selection[0]
                    mail_id = int(self.mail_tree.item(item, 'text'))
                    
                    self.cursor.execute("SELECT message_id FROM mails WHERE id = ?", (mail_id,))
                    message_id = self.cursor.fetchone()[0]
                    
                    source_path = os.path.join(self.attachments_dir, f"{message_id}_{filename}")
                    if os.path.exists(source_path):
                        shutil.copy2(source_path, save_path)
                        messagebox.showinfo("성공", "첨부파일이 저장되었습니다.")
                    else:
                        messagebox.showerror("오류", "첨부파일을 찾을 수 없습니다.")
    
    def save_all_attachments(self):
        mail_selection = self.mail_tree.selection()
        if mail_selection:
            save_dir = filedialog.askdirectory(title="첨부파일 저장 폴더 선택")
            if save_dir:
                item = mail_selection[0]
                mail_id = int(self.mail_tree.item(item, 'text'))
                
                self.cursor.execute("SELECT message_id, attachments FROM mails WHERE id = ?", (mail_id,))
                result = self.cursor.fetchone()
                message_id = result[0]
                attachments = json.loads(result[1]) if result[1] else []
                
                saved = 0
                for filename in attachments:
                    source_path = os.path.join(self.attachments_dir, f"{message_id}_{filename}")
                    if os.path.exists(source_path):
                        dest_path = os.path.join(save_dir, filename)
                        shutil.copy2(source_path, dest_path)
                        saved += 1
                
                if saved > 0:
                    messagebox.showinfo("성공", f"{saved}개의 첨부파일이 저장되었습니다.")
                else:
                    messagebox.showinfo("알림", "저장할 첨부파일이 없습니다.")
    
    def create_backup(self):
        backup_path = filedialog.asksaveasfilename(
            defaultextension=".zip",
            initialfile=f"mail_backup_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}.zip",
            filetypes=[("ZIP files", "*.zip"), ("All files", "*.*")]
        )
        
        if backup_path:
            with zipfile.ZipFile(backup_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
                zipf.write(self.db_path, os.path.basename(self.db_path))
                
                if os.path.exists(self.attachments_dir):
                    for root, dirs, files in os.walk(self.attachments_dir):
                        for file in files:
                            file_path = os.path.join(root, file)
                            arcname = os.path.relpath(file_path, os.path.dirname(self.attachments_dir))
                            zipf.write(file_path, arcname)
            
            messagebox.showinfo("성공", f"백업이 생성되었습니다:\n{backup_path}")
    
    def restore_backup(self):
        if messagebox.askyesno("경고", "현재 데이터가 모두 삭제되고 백업으로 교체됩니다.\n계속하시겠습니까?"):
            backup_path = filedialog.askopenfilename(
                title="백업 파일 선택",
                filetypes=[("ZIP files", "*.zip"), ("All files", "*.*")]
            )
            
            if backup_path:
                try:
                    with zipfile.ZipFile(backup_path, 'r') as zipf:
                        zipf.extractall('.')
                    
                    self.load_mails_from_db()
                    messagebox.showinfo("성공", "백업이 복원되었습니다.")
                except Exception as e:
                    messagebox.showerror("오류", f"백업 복원 실패:\n{str(e)}")
    
    def show_context_menu(self, event):
        try:
            self.mail_tree.selection_set(self.mail_tree.identify_row(event.y))
            self.context_menu.post(event.x_root, event.y_root)
        except:
            pass
    
    def close_app(self):
        self.conn.close()
        self.root.quit()


def main():
    root = tk.Tk()
    app = MailBackupManager(root)
    root.mainloop()


if __name__ == "__main__":
    main()