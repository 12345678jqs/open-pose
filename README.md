# OpenPose-like Web Demo (MoveNet)

这是一个简单的浏览器端人体关键点检测演示，使用 TensorFlow.js 的 MoveNet 模型（速度快、无需后端）。

功能
- 使用摄像头实时检测人体关键点
- 在 canvas 上绘制关键点和骨架
- 支持镜像翻转（自拍模式）

快速运行
1. 将 `index.html`、`script.js` 放在同一目录。
2. 在目录下启动静态服务器，例如：
   - Python 3: `python -m http.server 8000`
   - 或使用任意静态文件服务器
3. 用浏览器打开 `http://localhost:8000` 并允许摄像头权限。

后续可扩展
- 改用真实 OpenPose 后端（C++/GPU）并通过 WebSocket/HTTP 返回关键点
- 增加动作识别、关键点导出（JSON/CSV）、录制视频叠加关键点
- 移植为移动原生应用（使用 TensorFlow Lite 或服务器端推理)
