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

    let r = [];

    doc.querySelectorAll('.m_10').forEach(e => {
        let t = e.querySelector('.f_r.f_12.h_10')?.textContent.trim() || "UNKNOWN_TIME";
        let n = e.querySelector('.m_5.l_h_10.break')?.textContent.trim() || "UNKNOWN_TITLE";
        let i = e.querySelector('img[src*="diff_"]')?.getAttribute("src")?.split("/").pop();
        let l = d[i] || "UNKNOWN_DIFFICULTY";
        let s = e.querySelector('.technical_score_block .f_20')?.textContent.trim() || 
                e.querySelector('.technical_score_block_new .f_20')?.textContent.trim() || 
                "UNKNOWN_SCORE";

        r.push(`${t} \\ ${n} \\ ${l} \\ ${s}`); // ✅ `\` 区切りで1行にまとめる
    });

    let scoreData = r.join(" \\ "); // ✅ 各プレイデータを `\` で区切る

    // ✅ **Googleフォーム①（スコアデータ送信用）**
    const formUrl1 = "https://docs.google.com/forms/d/e/1FAIpQLSf9f8JF2wCGCCiRhVzFtrYrFQtKM4WnguaAbJjVjqa_5z3xRQ/formResponse";  
    const entryAuthCode = "entry.789034398"; // 認証コードのエントリーID（変更する）
    const entryScoreData = "entry.1093799627"; // スコアデータのエントリーID（変更する）

    // 🔹 フォームデータを構築
    const formData = new URLSearchParams({
        [entryAuthCode]: authCode,
        [entryScoreData]: scoreData
    });

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
