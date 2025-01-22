// script.js

document.addEventListener("DOMContentLoaded", function () {
  const roulette = document.getElementById("roulette");
  const resultContainer = document.getElementById("result-container");
  const resultImage = document.getElementById("result-image");
  let isSpinning = false;
  let currentRotation = 0;

  let inactivityTimeout; // 非表示用タイマー
  let isScrollTextVisible = false; // スクロールテキストが表示中かどうか

  // セクターと画像の対応表
  const sectors = [
    { name: "1BB", image: "1BB.png" },
    { name: "25BB", image: "25BB.png" },
    { name: "1BB", image: "1BB.png" },
    { name: "2BB", image: "2BB.png" },
    { name: "5BB", image: "5BB.png" },
    { name: "2BB", image: "2BB.png" },
    { name: "1BB", image: "1BB.png" },
    { name: "2BB", image: "2BB.png" },
    { name: "10BB", image: "10BB.png" },
    { name: "2BB", image: "2BB.png" },
    { name: "1BB", image: "1BB.png" },
    { name: "5BB", image: "5BB.png" },
    { name: "1BB", image: "1BB.png" },
    { name: "2BB", image: "2BB.png" },
  ];

  // ビープ音
  const beep = new Audio("beep.wav");
  const resultEffect = new Audio("result_effect.mp3"); // 結果表示音

  // スクロールアニメーションのメッセージ
  const scrollMessages = [
    "本日はUltra Ring Day",
    "フルハウス以上の役でルーレットStart!!",
    "ルーレットで出たBB数分が次のポットに投入!!",
    "役が完成していて、相手に降りられてしまっても、ハンドをショーすればルーレットStart!!",
  ];

  // 特殊演出用の動画設定
  const specialEffectVideo = document.createElement("video");
  specialEffectVideo.src = "フリーズ.mp4";
  specialEffectVideo.className = "special-effect-video";
  specialEffectVideo.autoplay = true;
  specialEffectVideo.muted = true;
  specialEffectVideo.controls = false;

  // 電光掲示板のスクロールテキストを表示
  function showScrollText() {
    const scrollTextContainer = document.getElementById(
      "scroll-text-container"
    );
    const scrollText = document.querySelector(".scroll-text span");

    // テキストを結合して設定
    scrollText.textContent = scrollMessages.join("           "); // メッセージ間にスペースを挿入
    scrollTextContainer.style.display = "flex"; // 表示

    // アニメーションの初期状態を設定
    scrollTextContainer.style.transform = "scale(0)"; // 縮小状態
    scrollTextContainer.style.opacity = "0"; // 完全に透明
    setTimeout(() => {
      scrollTextContainer.style.transition =
        "transform 0.5s ease, opacity 0.5s ease"; // フェードインと拡大のアニメーション
      scrollTextContainer.style.transform = "scale(1)"; // 元の大きさに戻す
      scrollTextContainer.style.opacity = "1"; // 完全に表示
    }, 10);

    isScrollTextVisible = true; // 表示中フラグをセット
  }

  // 電光掲示板のスクロールテキストを非表示
  function hideScrollText() {
    const scrollTextContainer = document.getElementById(
      "scroll-text-container"
    );

    // フェードアウトのアニメーションを適用
    scrollTextContainer.style.transition =
      "transform 0.5s ease, opacity 0.5s ease"; // フェードアウトと縮小のアニメーション
    scrollTextContainer.style.transform = "scale(0)"; // 再び縮小状態にする
    scrollTextContainer.style.opacity = "0"; // 完全に透明

    setTimeout(() => {
      scrollTextContainer.style.display = "none"; // 非表示
    }, 500); // アニメーション完了後に非表示
    isScrollTextVisible = false; // 表示中フラグをリセット
  }

  // 非操作タイマーをリセット
  function resetInactivityTimer() {
    clearTimeout(inactivityTimeout); // 前のタイマーをクリア
    if (isScrollTextVisible) return; // スクロールテキストが表示中ならリセットしない
    inactivityTimeout = setTimeout(() => {
      showScrollText(); // 一定時間操作されなかった場合にスクロールテキストを表示
      console.log(
        "一定時間操作がなかったためスクロールテキストを表示しました。"
      );
    }, 6000); // 6秒後にスクロールテキストを表示
  }

  // エンターキーでルーレットを回転
  document.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      if (isSpinning) return; // すでに回転中なら何もしない
      isSpinning = true;

      hideScrollText(); // ここでスクロールテキストを非表示にする

      resetInactivityTimer(); // 非操作タイマーをリセット

      const spinDuration = Math.random() * 8000 + 11000; // 回転時間をランダムに設定
      const startTime = performance.now(); // アニメーション開始時刻
      const initialSpeed = 5; // 初期回転速度
      const finalRotation = currentRotation + 360 * 5 + Math.random() * 360; // 最終回転角度
      const sectorAngle = 360 / sectors.length; // 各セクターの角度
      let lastBeepAngle = -1; // 最後にビープ音が鳴った角度

      function spin(currentTime) {
        const elapsed = currentTime - startTime; // 経過時間
        const progress = elapsed / spinDuration; // アニメーション進行度 (0～1)

        if (progress < 1) {
          const easeProgress = easeOutCubic(progress); // イージング関数を適用
          currentRotation += initialSpeed * (1 - easeProgress); // 減速しながら角度を更新
          roulette.style.transform = `rotate(${currentRotation}deg)`; // 回転を適用

          // 現在の角度を確認し、境界に近づいたらビープ音を再生
          const normalizedAngle = ((currentRotation % 360) + 360) % 360; // 現在の角度 (正の値に)
          const sectorIndex = Math.floor(normalizedAngle / sectorAngle);

          // 境界に近い場合かつ前回のビープ音と異なる角度の場合にビープ音を再生
          if (sectorIndex !== lastBeepAngle) {
            beep.currentTime = 0; // 再生位置をリセット
            beep.play();
            lastBeepAngle = sectorIndex; // 最後にビープ音が鳴った角度を更新
          }

          requestAnimationFrame(spin); // 次のフレームをリクエスト
        } else {
          finalizePosition(); // 回転終了時の処理を実行
        }
      }

      function finalizePosition() {
        const normalizedAngle = currentRotation % 360; // 現在の角度を360度内に収める
        const sectorIndex =
          Math.floor((360 - normalizedAngle) / sectorAngle) % sectors.length; // 当選セクターを計算

        const selectedSector = sectors[sectorIndex]; // 当選セクターを取得
        showResult(selectedSector); // 結果を表示
        isSpinning = false; // 回転中フラグを解除

        // 特殊演出を発動させるか判定 (63.4分の1の確率)
        if (Math.random() < 1 / 63.4) {
          triggerSpecialEffect();
        }
      }

      function showResult(sector) {
        if (sector.image) {
          resultImage.src = sector.image;
        } else {
          console.warn("セクターに画像が設定されていません");
        }

        resultContainer.classList.add("animate"); // 結果表示のアニメーションを追加
        resultEffect.play(); // 結果表示音を再生

        setTimeout(() => {
          resultContainer.classList.remove("animate");
          resetInactivityTimer(); // 非表示タイマーをリセット
        }, 7000); // アニメーションが完了した後リセット
      }

      function triggerSpecialEffect() {
        // 特殊演出としてフリーズ動画を表示する
        document.body.appendChild(specialEffectVideo);
        specialEffectVideo.play();

        specialEffectVideo.onended = () => {
          document.body.removeChild(specialEffectVideo); // 動画終了後に削除
        };
      }

      function easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
      }

      requestAnimationFrame(spin); // 回転開始
    }
  });

  // 非操作タイマーをリセット
  function resetInactivityTimer() {
    clearTimeout(inactivityTimeout); // 前のタイマーをクリア
    inactivityTimeout = setTimeout(() => {
      if (!isScrollTextVisible) {
        showScrollText(); // 一定時間操作されなかった場合にスクロールテキストを表示
      }
    }, 30000); // 30秒後にスクロールテキストを表示
  }
});
