(async function() {
    if (window.location.href !== "https://ongeki-net.com/ongeki-mobile/record/playlog/") {
        alert("このブックマークレットはオンゲキNETのプレイ履歴ページでのみ使用できます。");
        return;
    }

    // 🔹 公開鍵を取得（GitHub Pagesなどから）
    const publicKeyPem = await fetch("https://plana1231.github.io/Ong_AutoSA/public.pem").then(res => res.text());

    // 🔹 公開鍵をインポート
    async function importPublicKey(pem) {
        const binaryDer = Uint8Array.from(atob(pem.replace(/-----(BEGIN|END) PUBLIC KEY-----/g, "").trim()), c => c.charCodeAt(0));
        return window.crypto.subtle.importKey(
            "spki",
            binaryDer,
            { name: "RSA-OAEP", hash: "SHA-256" },
            false,
            ["encrypt"]
        );
    }

    const publicKey = await importPublicKey(publicKeyPem);

    // 🔹 スコアデータを取得
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

    let rawData = r.join("\n");
    
    // 🔹 RSA暗号化
    async function encryptData(data, key) {
        const encodedData = new TextEncoder().encode(data);
        const encrypted = await window.crypto.subtle.encrypt({ name: "RSA-OAEP" }, key, encodedData);
        return btoa(String.fromCharCode(...new Uint8Array(encrypted))); // Base64変換
    }

    const encryptedData = await encryptData(rawData, publicKey);

    // 🔹 クリップボードにコピー
    navigator.clipboard.writeText(encryptedData).then(() => {
        alert("データをクリップボードにコピーしました！");
    }).catch(e => {
        console.error("コピー失敗", e);
        alert("コピー失敗");
    });
})();
