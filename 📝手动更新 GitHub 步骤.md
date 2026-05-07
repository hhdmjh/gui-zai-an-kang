# 📝 手动更新 GitHub - 超简单步骤

## 为什么需要手动更新？
Git 推送一直卡在认证环节，我们直接用 GitHub 网页更新，**3 分钟搞定**！

---

## 步骤 1：打开 GitHub 仓库
👉 点击链接：https://github.com/hhdmjh/gui-zai-an-kang

---

## 步骤 2：更新 login.html（1 分钟）

1. 在文件列表中点击 **`login.html`**

2. 点击右上角的 **✏️ 铅笔图标**（编辑按钮）

3. 找到第 **417-421 行**，你会看到：
   ```javascript
   if (result.success) {
       // 保存 token 和用户信息
       localStorage.setItem('token', result.data.token);
       localStorage.setItem('currentUser', JSON.stringify(result.data));
   ```

4. 在 `localStorage.setItem('currentUser', ...)` 这一行**后面**，**添加一行**：
   ```javascript
   localStorage.setItem('isLoggedIn', 'true');
   ```

5. 修改后的完整代码应该是：
   ```javascript
   if (result.success) {
       // 保存 token、用户信息和登录状态
       localStorage.setItem('token', result.data.token);
       localStorage.setItem('currentUser', JSON.stringify(result.data));
       localStorage.setItem('isLoggedIn', 'true');
   ```

6. 滚动到页面最底部

7. 在 "Commit changes" 输入框中输入：`修复登录状态保存问题`

8. 点击绿色按钮 **✅ Commit changes**

---

## 步骤 3：更新 community.html（1 分钟）

1. 回到仓库首页，点击 **`community.html`**

2. 点击右上角的 **✏️ 铅笔图标**

3. 找到第 **154-158 行**，你会看到：
   ```javascript
   window.addEventListener('DOMContentLoaded', () => {
       const isLoggedIn = localStorage.getItem('isLoggedIn');
       if (isLoggedIn !== 'true') {
           window.location.href = 'loogin.html';
   ```

4. **替换**这几行为：
   ```javascript
   window.addEventListener('DOMContentLoaded', () => {
       const token = localStorage.getItem('token');
       const isLoggedIn = localStorage.getItem('isLoggedIn');
       
       // 检查 token 或 isLoggedIn 任一有效即可
       if (!token && isLoggedIn !== 'true') {
           window.location.href = 'login.html';
           return;
       }
   ```

5. 滚动到底部，输入提交信息：`修复社区服务登录检查`

6. 点击 **✅ Commit changes**

---

## 步骤 4：更新 script.js（30 秒）

1. 回到仓库首页，点击 **`script.js`**

2. 点击右上角的 **✏️ 铅笔图标**

3. 按 `Ctrl+F` 搜索 `loogin.html`

4. 找到第 **79 行**，将：
   ```
   window.location.href = 'loogin.html';
   ```
   改为：
   ```
   window.location.href = 'login.html';
   ```

5. 滚动到底部，输入提交信息：`修复拼写错误`

6. 点击 **✅ Commit changes**

---

## 步骤 5：等待 GitHub Pages 更新

1. 等待 **1-2 分钟**

2. 访问：https://hhdmjh.github.io/gui-zai-an-kang/

3. 登录账号（admin/123456）

4. 点击"社区服务"导航

5. ✅ 应该可以正常访问了！

---

## 完成！🎉

如果还有问题，请截图告诉我：
- 登录后的页面
- 点击社区服务后的页面
- 浏览器控制台的错误（按 F12 查看）

---

## 小贴士
- 每次修改后都要点击底部的 "Commit changes" 保存
- GitHub Pages 更新有延迟，请耐心等待 1-2 分钟
- 如果页面还是旧的，按 `Ctrl+F5` 强制刷新浏览器缓存
