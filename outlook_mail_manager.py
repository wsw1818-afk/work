import tkinter as tk
from tkinter import ttk, messagebox, scrolledtext, filedialog
import win32com.client
import os
import datetime
import json
from pathlib import Path
import re


class OutlookMailManager:
    def __init__(self, root):
        self.root = root
        self.root.title("Outlook 메일 관리자")
        self.root.geometry("1200x700")
        
        self.mails = []
        self.filtered_mails = []
        self.current_filter = ""
        self.tags_file = "mail_tags.json"
        self.load_tags()
        
        self.setup_ui()
        self.load_outlook_mails()
    
    def load_tags(self):
        try:
            if os.path.exists(self.tags_file):
                with open(self.tags_file, 'r', encoding='utf-8') as f:
                    self.mail_tags = json.load(f)
            else:
                self.mail_tags = {}
        except:
            self.mail_tags = {}
    
    def save_tags(self):
        with open(self.tags_file, 'w', encoding='utf-8') as f:
            json.dump(self.mail_tags, f, ensure_ascii=False, indent=2)
    
    def setup_ui(self):
        menubar = tk.Menu(self.root)
        self.root.config(menu=menubar)
        
        file_menu = tk.Menu(menubar, tearoff=0)
        menubar.add_cascade(label="파일", menu=file_menu)
        file_menu.add_command(label="새로고침", command=self.refresh_mails)
        file_menu.add_command(label="내보내기", command=self.export_mails)
        file_menu.add_separator()
        file_menu.add_command(label="종료", command=self.root.quit)
        
        toolbar = ttk.Frame(self.root)
        toolbar.pack(side=tk.TOP, fill=tk.X, padx=5, pady=5)
        
        ttk.Label(toolbar, text="검색:").pack(side=tk.LEFT, padx=5)
        self.search_var = tk.StringVar()
        self.search_entry = ttk.Entry(toolbar, textvariable=self.search_var, width=30)
        self.search_entry.pack(side=tk.LEFT, padx=5)
        self.search_entry.bind('<Return>', lambda e: self.search_mails())
        
        ttk.Button(toolbar, text="검색", command=self.search_mails).pack(side=tk.LEFT, padx=5)
        ttk.Button(toolbar, text="초기화", command=self.clear_search).pack(side=tk.LEFT, padx=5)
        
        ttk.Label(toolbar, text="폴더:").pack(side=tk.LEFT, padx=20)
        self.folder_var = tk.StringVar()
        self.folder_combo = ttk.Combobox(toolbar, textvariable=self.folder_var, width=20)
        self.folder_combo.pack(side=tk.LEFT, padx=5)
        self.folder_combo.bind('<<ComboboxSelected>>', lambda e: self.filter_by_folder())
        
        main_frame = ttk.Frame(self.root)
        main_frame.pack(fill=tk.BOTH, expand=True, padx=5, pady=5)
        
        left_frame = ttk.Frame(main_frame)
        left_frame.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        
        ttk.Label(left_frame, text="메일 목록", font=('Arial', 10, 'bold')).pack(anchor=tk.W)
        
        list_frame = ttk.Frame(left_frame)
        list_frame.pack(fill=tk.BOTH, expand=True, pady=5)
        
        self.mail_tree = ttk.Treeview(list_frame, columns=('Date', 'From', 'Subject', 'Tags'), show='tree headings')
        self.mail_tree.heading('#0', text='ID')
        self.mail_tree.heading('Date', text='날짜')
        self.mail_tree.heading('From', text='보낸사람')
        self.mail_tree.heading('Subject', text='제목')
        self.mail_tree.heading('Tags', text='태그')
        
        self.mail_tree.column('#0', width=50)
        self.mail_tree.column('Date', width=150)
        self.mail_tree.column('From', width=150)
        self.mail_tree.column('Subject', width=300)
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
        
        right_frame = ttk.Frame(main_frame, width=400)
        right_frame.pack(side=tk.RIGHT, fill=tk.BOTH, padx=(10, 0))
        right_frame.pack_propagate(False)
        
        ttk.Label(right_frame, text="메일 내용", font=('Arial', 10, 'bold')).pack(anchor=tk.W)
        
        info_frame = ttk.Frame(right_frame)
        info_frame.pack(fill=tk.X, pady=5)
        
        self.info_labels = {}
        for field in ['보낸사람', '받는사람', '날짜', '제목']:
            frame = ttk.Frame(info_frame)
            frame.pack(fill=tk.X, pady=2)
            ttk.Label(frame, text=f"{field}:", width=10).pack(side=tk.LEFT)
            self.info_labels[field] = ttk.Label(frame, text="", relief=tk.SUNKEN)
            self.info_labels[field].pack(side=tk.LEFT, fill=tk.X, expand=True)
        
        tag_frame = ttk.Frame(right_frame)
        tag_frame.pack(fill=tk.X, pady=5)
        ttk.Label(tag_frame, text="태그:").pack(side=tk.LEFT)
        self.tag_entry = ttk.Entry(tag_frame, width=20)
        self.tag_entry.pack(side=tk.LEFT, padx=5)
        ttk.Button(tag_frame, text="태그 추가", command=self.add_tag).pack(side=tk.LEFT)
        
        self.content_text = scrolledtext.ScrolledText(right_frame, wrap=tk.WORD, height=20)
        self.content_text.pack(fill=tk.BOTH, expand=True, pady=5)
        
        status_bar = ttk.Frame(self.root)
        status_bar.pack(side=tk.BOTTOM, fill=tk.X)
        self.status_label = ttk.Label(status_bar, text="준비", relief=tk.SUNKEN)
        self.status_label.pack(side=tk.LEFT, fill=tk.X, expand=True)
        
        self.context_menu = tk.Menu(self.root, tearoff=0)
        self.context_menu.add_command(label="태그 추가/편집", command=self.edit_tag)
        self.context_menu.add_command(label="태그 제거", command=self.remove_tag)
        self.context_menu.add_separator()
        self.context_menu.add_command(label="삭제", command=self.delete_mail)
        self.context_menu.add_command(label="중요 표시", command=self.mark_important)
    
    def load_outlook_mails(self):
        try:
            self.status_label.config(text="Outlook 메일을 불러오는 중...")
            outlook = win32com.client.Dispatch("Outlook.Application")
            namespace = outlook.GetNamespace("MAPI")
            
            inbox = namespace.GetDefaultFolder(6)  # 6 = Inbox
            
            folders = {"받은편지함": inbox}
            self.get_subfolders(inbox, folders, "받은편지함")
            
            self.folder_combo['values'] = list(folders.keys())
            if folders:
                self.folder_combo.current(0)
            
            self.mails = []
            for folder_name, folder in folders.items():
                messages = folder.Items
                messages.Sort("[ReceivedTime]", True)
                
                count = min(100, messages.Count)
                for i in range(count):
                    try:
                        message = messages.Item(i + 1)
                        mail_data = {
                            'id': len(self.mails),
                            'subject': message.Subject,
                            'sender': str(message.SenderEmailAddress),
                            'sender_name': str(message.SenderName),
                            'to': str(message.To) if hasattr(message, 'To') else '',
                            'date': message.ReceivedTime.strftime('%Y-%m-%d %H:%M'),
                            'body': message.Body,
                            'folder': folder_name,
                            'entry_id': message.EntryID
                        }
                        self.mails.append(mail_data)
                    except Exception as e:
                        continue
            
            self.filtered_mails = self.mails.copy()
            self.update_mail_list()
            self.status_label.config(text=f"{len(self.mails)}개의 메일을 불러왔습니다.")
            
        except Exception as e:
            messagebox.showerror("오류", f"Outlook 메일을 불러올 수 없습니다:\n{str(e)}")
            self.status_label.config(text="메일 불러오기 실패")
    
    def get_subfolders(self, folder, folders_dict, parent_path):
        try:
            for subfolder in folder.Folders:
                folder_path = f"{parent_path}/{subfolder.Name}"
                folders_dict[folder_path] = subfolder
                self.get_subfolders(subfolder, folders_dict, folder_path)
        except:
            pass
    
    def update_mail_list(self):
        for item in self.mail_tree.get_children():
            self.mail_tree.delete(item)
        
        for mail in self.filtered_mails:
            mail_id = str(mail['id'])
            tags = self.mail_tags.get(mail_id, [])
            tag_str = ', '.join(tags) if tags else ''
            
            self.mail_tree.insert('', 'end', 
                                 text=mail_id,
                                 values=(mail['date'], 
                                        mail['sender_name'], 
                                        mail['subject'][:50],
                                        tag_str))
    
    def on_mail_select(self, event):
        selection = self.mail_tree.selection()
        if selection:
            item = selection[0]
            mail_id = int(self.mail_tree.item(item, 'text'))
            
            mail = next((m for m in self.mails if m['id'] == mail_id), None)
            if mail:
                self.info_labels['보낸사람'].config(text=mail['sender_name'])
                self.info_labels['받는사람'].config(text=mail['to'])
                self.info_labels['날짜'].config(text=mail['date'])
                self.info_labels['제목'].config(text=mail['subject'])
                
                self.content_text.delete(1.0, tk.END)
                self.content_text.insert(1.0, mail['body'])
    
    def search_mails(self):
        search_term = self.search_var.get().lower()
        if not search_term:
            self.filtered_mails = self.mails.copy()
        else:
            self.filtered_mails = [
                mail for mail in self.mails
                if search_term in mail['subject'].lower() or
                   search_term in mail['sender_name'].lower() or
                   search_term in mail['body'].lower()
            ]
        self.update_mail_list()
        self.status_label.config(text=f"검색 결과: {len(self.filtered_mails)}개")
    
    def clear_search(self):
        self.search_var.set("")
        self.filtered_mails = self.mails.copy()
        self.update_mail_list()
        self.status_label.config(text=f"전체 메일: {len(self.mails)}개")
    
    def filter_by_folder(self):
        folder_name = self.folder_var.get()
        if folder_name:
            self.filtered_mails = [
                mail for mail in self.mails
                if mail['folder'] == folder_name
            ]
            self.update_mail_list()
            self.status_label.config(text=f"{folder_name}: {len(self.filtered_mails)}개")
    
    def add_tag(self):
        selection = self.mail_tree.selection()
        if selection:
            item = selection[0]
            mail_id = self.mail_tree.item(item, 'text')
            tag = self.tag_entry.get().strip()
            
            if tag:
                if mail_id not in self.mail_tags:
                    self.mail_tags[mail_id] = []
                if tag not in self.mail_tags[mail_id]:
                    self.mail_tags[mail_id].append(tag)
                    self.save_tags()
                    self.update_mail_list()
                    self.tag_entry.delete(0, tk.END)
                    messagebox.showinfo("성공", f"태그 '{tag}'가 추가되었습니다.")
    
    def edit_tag(self):
        selection = self.mail_tree.selection()
        if selection:
            item = selection[0]
            mail_id = self.mail_tree.item(item, 'text')
            
            current_tags = self.mail_tags.get(mail_id, [])
            tag_str = ', '.join(current_tags)
            
            dialog = tk.Toplevel(self.root)
            dialog.title("태그 편집")
            dialog.geometry("300x100")
            
            ttk.Label(dialog, text="태그 (쉼표로 구분):").pack(pady=5)
            tag_entry = ttk.Entry(dialog, width=40)
            tag_entry.pack(pady=5)
            tag_entry.insert(0, tag_str)
            
            def save_tags():
                new_tags = [t.strip() for t in tag_entry.get().split(',') if t.strip()]
                self.mail_tags[mail_id] = new_tags
                self.save_tags()
                self.update_mail_list()
                dialog.destroy()
            
            ttk.Button(dialog, text="저장", command=save_tags).pack(pady=5)
    
    def remove_tag(self):
        selection = self.mail_tree.selection()
        if selection:
            item = selection[0]
            mail_id = self.mail_tree.item(item, 'text')
            
            if mail_id in self.mail_tags:
                del self.mail_tags[mail_id]
                self.save_tags()
                self.update_mail_list()
                messagebox.showinfo("성공", "태그가 제거되었습니다.")
    
    def show_context_menu(self, event):
        try:
            self.mail_tree.selection_set(self.mail_tree.identify_row(event.y))
            self.context_menu.post(event.x_root, event.y_root)
        except:
            pass
    
    def delete_mail(self):
        selection = self.mail_tree.selection()
        if selection:
            if messagebox.askyesno("확인", "선택한 메일을 삭제하시겠습니까?"):
                item = selection[0]
                mail_id = int(self.mail_tree.item(item, 'text'))
                
                mail = next((m for m in self.mails if m['id'] == mail_id), None)
                if mail:
                    try:
                        outlook = win32com.client.Dispatch("Outlook.Application")
                        namespace = outlook.GetNamespace("MAPI")
                        message = namespace.GetItemFromID(mail['entry_id'])
                        message.Delete()
                        
                        self.mails.remove(mail)
                        self.filtered_mails = [m for m in self.filtered_mails if m['id'] != mail_id]
                        self.update_mail_list()
                        messagebox.showinfo("성공", "메일이 삭제되었습니다.")
                    except Exception as e:
                        messagebox.showerror("오류", f"메일 삭제 실패:\n{str(e)}")
    
    def mark_important(self):
        selection = self.mail_tree.selection()
        if selection:
            item = selection[0]
            mail_id = self.mail_tree.item(item, 'text')
            
            if mail_id not in self.mail_tags:
                self.mail_tags[mail_id] = []
            if "중요" not in self.mail_tags[mail_id]:
                self.mail_tags[mail_id].append("중요")
                self.save_tags()
                self.update_mail_list()
                messagebox.showinfo("성공", "중요 표시가 추가되었습니다.")
    
    def refresh_mails(self):
        self.mails.clear()
        self.filtered_mails.clear()
        self.load_outlook_mails()
    
    def export_mails(self):
        file_path = filedialog.asksaveasfilename(
            defaultextension=".json",
            filetypes=[("JSON files", "*.json"), ("All files", "*.*")]
        )
        if file_path:
            try:
                export_data = {
                    'mails': self.filtered_mails,
                    'tags': self.mail_tags
                }
                with open(file_path, 'w', encoding='utf-8') as f:
                    json.dump(export_data, f, ensure_ascii=False, indent=2)
                messagebox.showinfo("성공", f"{len(self.filtered_mails)}개의 메일이 내보내졌습니다.")
            except Exception as e:
                messagebox.showerror("오류", f"내보내기 실패:\n{str(e)}")


def main():
    root = tk.Tk()
    app = OutlookMailManager(root)
    root.mainloop()


if __name__ == "__main__":
    main()