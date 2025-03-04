(async function() {
    if (window.location.href !== "https://ongeki-net.com/ongeki-mobile/record/playlog/") {
        alert("このブックマークレットはオンゲキNETのプレイ履歴ページでのみ使用できます。");
        return;
    }

    // GoogleフォームのエントリーIDを設定
    const formUrl = "https://docs.google.com/forms/d/e/XXXXXXXXXXXXXX/formResponse"; // フォームURL（自分のに置き換えて）
    const entryTime = "entry.789034398"; // プレイ日時のエントリーID
    const entryTitle = "entry.1854790677"; // 曲名のエントリーID
    const entryDiff = "entry.1367180016"; // 難易度のエントリーID
    const entryScore = "entry.1093799627"; // スコアのエントリーID

    let d = {
        "diff_basic.png": "BASIC",
        "diff_advanced.png": "ADVANCED",
        "diff_expert.png": "EXPERT",
        "diff_master.png": "MASTER",
        "diff_lunatic.png": "LUNATIC"
    };

    let latestEntry = document.querySelector('.m_10');
    if (!latestEntry) {
        alert("プレイ履歴が見つかりません！");
        return;
    }

    let time = latestEntry.querySelector('.f_r.f_12.h_10')?.textContent.trim() || "UNKNOWN_TIME";
    let title = latestEntry.querySelector('.m_5.l_h_10.break')?.textContent.trim() || "UNKNOWN_TITLE";
    let img = latestEntry.querySelector('img[src*="diff_"]')?.getAttribute("src")?.split("/").pop();
    let difficulty = d[img] || "UNKNOWN_DIFFICULTY";
    let score = latestEntry.querySelector('.technical_score_block .f_20')?.textContent.trim() || 
                latestEntry.querySelector('.technical_score_block_new .f_20')?.textContent.trim() || 
                "UNKNOWN_SCORE";

    // Googleフォームにデータ送信
    const formData = new URLSearchParams({
        [entryTime]: time,
        [entryTitle]: title,
        [entryDiff]: difficulty,
        [entryScore]: score
    });

    await fetch(formUrl, {
        method: "POST",
        body: formData,
        mode: "no-cors"
    });

    alert(`プレイ履歴をGoogleフォームに直接送信しました！\n${time} | ${title} | ${difficulty} | ${score}`);
})();
