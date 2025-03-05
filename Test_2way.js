(async function() {
    if (window.location.href !== "https://ongeki-net.com/ongeki-mobile/record/playlog/") {
        alert("このブックマークレットはオンゲキNETのプレイ履歴ページでのみ使用できます。");
        return;
    }

    try {
        // オリジナルのHTMLを再取得（改ざん防止）
        let res = await fetch(window.location.href, { credentials: "include" });
        let html = await res.text();
        let parser = new DOMParser();
        let doc = parser.parseFromString(html, "text/html");

        processData(doc); // 取得したHTMLからデータを抽出して送信
    } catch (err) {
        alert("元データの取得に失敗しました。ページのリロードを試してください。");
        console.error(err);
    }
})();

async function processData(doc) {
    // 🔹 認証コードを生成（ランダムな英数字8桁）
    function generateAuthCode() {
        return [...Array(8)].map(() => Math.random().toString(36)[2]).join("").toUpperCase();
    }
    const authCode = generateAuthCode();

    // 🔹 難易度のマッピング
    let d = {
        "diff_basic.png": "BASIC",
        "diff_advanced.png": "ADVANCED",
        "diff_expert.png": "EXPERT",
        "diff_master.png": "MASTER",
        "diff_lunatic.png": "LUNATIC"
    };

    let times = [], titles = [], difficulties = [], scores = [];

    doc.querySelectorAll('.m_10').forEach(e => {
        let t = e.querySelector('.f_r.f_12.h_10')?.textContent.trim() || "UNKNOWN_TIME";
        let n = e.querySelector('.m_5.l_h_10.break')?.textContent.trim() || "UNKNOWN_TITLE";
        let i = e.querySelector('img[src*="diff_"]')?.getAttribute("src")?.split("/").pop();
        let l = d[i] || "UNKNOWN_DIFFICULTY";
        let s = e.querySelector('.technical_score_block .f_20')?.textContent.trim() || 
                e.querySelector('.technical_score_block_new .f_20')?.textContent.trim() || 
                "UNKNOWN_SCORE";

        times.push(t);
        titles.push(n);
        difficulties.push(l);
        scores.push(s);
    });

    // ✅ **Googleフォーム①（スコアデータ送信用）**
    const formUrl1 = "https://docs.google.com/forms/d/e/1FAIpQLSf9f8JF2wCGCCiRhVzFtrYrFQtKM4WnguaAbJjVjqa_5z3xRQ/formResponse";  
    const entryAuthCode = "entry.789034398"; // 認証コードのエントリーID
    const entryTimes = "entry.1093799627"; // 日時のエントリーID
    const entryTitles = "entry.1198088861"; // 曲名のエントリーID
    const entryDifficulties = "entry.19673827"; // 難易度のエントリーID
    const entryScores = "entry.1246665799"; // スコアのエントリーID

    // 🔹 フォームデータを構築（各データを正しいエントリーIDに紐付け）
    const formData = new URLSearchParams();
    formData.append(entryAuthCode, authCode);
    formData.append(entryTimes, times.join(" \\ "));  // ✅ `\` 区切りで送信
    formData.append(entryTitles, titles.join(" \\ "));
    formData.append(entryDifficulties, difficulties.join(" \\ "));
    formData.append(entryScores, scores.join(" \\ "));

    // 🔹 フォームに自動送信
    await fetch(formUrl1, {
        method: "POST",
        body: formData,
        mode: "no-cors"
    }).then(() => {
        console.log("スコアデータ送信成功！");
    }).catch(e => {
        console.error("スコアデータ送信失敗", e);
    });

    // 🔹 認証コードをクリップボードにコピー
    navigator.clipboard.writeText(authCode).then(() => {
        alert(`スコアデータを送信しました！\n\n認証コード: ${authCode}\n\n次のフォームで認証コードを入力してください。`);
    }).catch(e => {
        console.error("コピー失敗", e);
        alert("コピー失敗");
    });

    // 🔹 Googleフォーム②（メールアドレス & 部門入力）を開く
    const formUrl2 = "https://docs.google.com/forms/d/e/1FAIpQLSfRfDw5S1_1svQ8TkpGO0Ot6GR4agnZ2gncwFaMDzmMBwZS_w/viewform?usp=header"; // ここを自分のフォームのURLに
    setTimeout(() => window.open(formUrl2, "_blank"), 2000); // 2秒後に開く
}

