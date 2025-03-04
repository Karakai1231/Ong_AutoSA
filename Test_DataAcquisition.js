(function(){
    if (!sessionStorage.getItem("reloaded")) {
        sessionStorage.setItem("reloaded", "true");
        location.reload();
    } else {
        sessionStorage.removeItem("reloaded");

        // ここでデータを取得
        let d = {
            "diff_basic.png": "BASIC",
            "diff_advanced.png": "ADVANCED",
            "diff_expert.png": "EXPERT",
            "diff_master.png": "MASTER",
            "diff_lunatic.png": "LUNATIC"
        };

        let r = [];

        document.querySelectorAll('.m_10').forEach(e => {
            let t = e.querySelector('.f_r.f_12.h_10')?.textContent.trim() || "UNKNOWN_TIME";
            let n = e.querySelector('.m_5.l_h_10.break')?.textContent.trim() || "UNKNOWN_TITLE";
            let i = e.querySelector('img[src*="diff_"]')?.getAttribute("src")?.split("/").pop();
            let l = d[i] || "UNKNOWN_DIFFICULTY";
            let s = e.querySelector('.technical_score_block .f_20')?.textContent.trim() || 
                    e.querySelector('.technical_score_block_new .f_20')?.textContent.trim() || 
                    "UNKNOWN_SCORE";

            r.push(`${t} | ${n} | ${l} | ${s}`);
        });

        let o = r.join("\n");
        navigator.clipboard.writeText(o).then(() => {
            alert("プレイ履歴をコピーしました！");
        }).catch(e => {
            alert("コピーに失敗しました");
        });
    }
})();
