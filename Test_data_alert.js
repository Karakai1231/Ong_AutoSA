(async function(){
    if(window.location.href !== "https://ongeki-net.com/ongeki-mobile/record/playlog/"){
        alert("このブックマークレットはオンゲキNETのプレイ履歴ページでのみ使用できます。");
        return;
    }

    try {
        // オリジナルのHTMLを再取得（開発者ツールでの改ざんを無視）
        let res = await fetch(window.location.href, { credentials: "include" });
        let html = await res.text();
        let parser = new DOMParser();
        let doc = parser.parseFromString(html, "text/html");

        extractData(doc); // 取得したオリジナルHTMLからデータを抽出
    } catch (err) {
        alert("元データの取得に失敗しました。ページのリロードを試してください。");
        console.error(err);
    }
})();

function extractData(doc) {
    let d = {
        "diff_basic.png": "BASIC",
        "diff_advanced.png": "ADVANCED",
        "diff_expert.png": "EXPERT",
        "diff_master.png": "MASTER",
        "diff_lunatic.png": "LUNATIC"
    };

    let r = [], skipped = 0;

    doc.querySelectorAll('.m_10').forEach(e => {
        let t = e.querySelector('.f_r.f_12.h_10')?.textContent.trim() || "UNKNOWN_TIME";
        let n = e.querySelector('.m_5.l_h_10.break')?.textContent.trim() || "UNKNOWN_TITLE";
        let i = e.querySelector('img[src*="diff_"]')?.getAttribute("src")?.split("/").pop();
        let l = d[i] || "UNKNOWN_DIFFICULTY";
        let s = e.querySelector('.technical_score_block .f_20')?.textContent.trim() || 
                e.querySelector('.technical_score_block_new .f_20')?.textContent.trim() || 
                "UNKNOWN_SCORE";

        (t !== "UNKNOWN_TIME" || n !== "UNKNOWN_TITLE" || s !== "UNKNOWN_SCORE") 
            ? r.push(`${t} | ${n} | ${l} | ${s}`) 
            : skipped++;
    });

    let o = r.join("\n");
    navigator.clipboard.writeText(o).then(() => {
        alert("プレイ履歴をクリップボードにコピーしました！\nGoogleフォームに移動します。");
        window.open("https://forms.gle/rxMiWfVmfef1TUxA8", "_blank");
    }).catch(e => {
        console.error("コピー失敗", e);
        alert("コピー失敗");
    });
}
