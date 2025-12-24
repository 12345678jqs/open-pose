// 简单的 MoveNet 摄像头演示
(async () => {
  const video = document.getElementById('video');
  const canvas = document.getElementById('overlay');
  const ctx = canvas.getContext('2d');
  const startBtn = document.getElementById('startBtn');
  const stopBtn = document.getElementById('stopBtn');
  const statusEl = document.getElementById('status');
  const flipCheckbox = document.getElementById('flip');

  let detector = null;
  let stream = null;
  let rafId = null;

  async function initDetector() {
    statusEl.textContent = '状态：加载模型...';
    // 创建 MoveNet detector（SinglePose.Lightning 更快，Thunder 更精确）
    detector = await poseDetection.createDetector(poseDetection.SupportedModels.MoveNet, {
      modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING
    });
    statusEl.textContent = '状态：模型已加载';
  }

  async function startCamera() {
    try {
      stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false });
      video.srcObject = stream;
      await video.play();
      // 设置 canvas 大小与 video 匹配
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      startLoop();
      startBtn.disabled = true;
      stopBtn.disabled = false;
      statusEl.textContent = '状态：摄像头已启动，正在检测...';
    } catch (e) {
      console.error(e);
      statusEl.textContent = '状态：摄像头启动失败 - ' + e.message;
    }
  }

  function stopCamera() {
    if (rafId) cancelAnimationFrame(rafId);
    if (stream) {
      stream.getTracks().forEach(t => t.stop());
      stream = null;
    }
    startBtn.disabled = false;
    stopBtn.disabled = true;
    statusEl.textContent = '状态：已停止';
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  async function startLoop() {
    if (!detector) await initDetector();

    async function render() {
      if (video.readyState < 2) {
        rafId = requestAnimationFrame(render);
        return;
      }
      // 调整 canvas 大小以防分辨率变化
      if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
      }

      // 估计姿势
      const poses = await detector.estimatePoses(video, { flipHorizontal: flipCheckbox.checked });

      // 绘制视频帧为背景（可不用，canvas 覆盖）
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      // 绘制关键点和骨架
      drawPoses(poses, ctx, flipCheckbox.checked);

      rafId = requestAnimationFrame(render);
    }
    render();
  }

  function drawPoses(poses, ctx, flip) {
    const scale = 1;
    ctx.lineWidth = 2;
    for (const pose of poses) {
      // 绘制连接（骨架）
      const edges = [
        ['left_shoulder','left_elbow'],['left_elbow','left_wrist'],
        ['right_shoulder','right_elbow'],['right_elbow','right_wrist'],
        ['left_shoulder','right_shoulder'],
        ['left_hip','left_knee'],['left_knee','left_ankle'],
        ['right_hip','right_knee'],['right_knee','right_ankle'],
        ['left_hip','right_hip'],
        ['left_shoulder','left_hip'],['right_shoulder','right_hip']
      ];
      const keypoints = {};
      for (const kp of pose.keypoints) keypoints[kp.name] = kp;

      ctx.strokeStyle = 'rgba(0,255,128,0.8)';
      for (const [a,b] of edges) {
        if (keypoints[a] && keypoints[b] && keypoints[a].score > 0.3 && keypoints[b].score > 0.3) {
          ctx.beginPath();
          const ax = keypoints[a].x * scale;
          const ay = keypoints[a].y * scale;
          const bx = keypoints[b].x * scale;
          const by = keypoints[b].y * scale;
          ctx.moveTo(ax, ay);
          ctx.lineTo(bx, by);
          ctx.stroke();
        }
      }

      // 绘制关键点
      for (const kp of pose.keypoints) {
        if (kp.score < 0.2) continue;
        ctx.fillStyle = 'rgba(255,0,128,0.9)';
        ctx.beginPath();
        ctx.arc(kp.x * scale, kp.y * scale, 4, 0, 2*Math.PI);
        ctx.fill();
      }
    }
  }

  // 绑定按钮
  startBtn.addEventListener('click', startCamera);
  stopBtn.addEventListener('click', stopCamera);

  // 预加载模型（可选）
  initDetector().catch(e => console.warn('模型初始化失败：', e));
})();
