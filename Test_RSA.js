(async function() {
    if (window.location.href !== "https://ongeki-net.com/ongeki-mobile/record/playlog/") {
        alert("このブックマークレットはオンゲキNETのプレイ履歴ページでのみ使用できます。");
        return;
    }

    // 🔹 公開鍵を取得（GitHub Pagesなどから）
    const publicKeyPem = await fetch("https://plana1231.github.io/Ong_AutoSA/public.pem").then(res => res.text());

    // 🔹 公開鍵をインポート（修正後）
    async function importPublicKey(pem) {
        const pemHeader = "-----BEGIN PUBLIC KEY-----";
        const pemFooter = "-----END PUBLIC KEY-----";
        const pemContents = pem.replace(pemHeader, "").replace(pemFooter, "").replace(/\s+/g, ""); // 改行削除
        const binaryDer = Uint8Array.from(atob(pemContents), c => c.charCodeAt(0));

        return await window.crypto.subtle.importKey(
            "spki",
            binaryDer.buffer, // `buffer` にする
            { name: "RSA-OAEP", hash: "SHA-256" },
            true,
            ["encrypt"]
        );
    }

    const publicKey = await importPublicKey(publicKeyPem);

    // 🔹 スコアデータの取得
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

    // 🔹 RSA暗号化（修正後）
    async function encryptData(data, key) {
        const encodedData = new TextEncoder().encode(data);
        const encrypted = await window.crypto.subtle.encrypt({ name: "RSA-OAEP" }, key, encodedData);
        return btoa(String.fromCharCode(...new Uint8Array(encrypted))); // Base64変換
    }

    const encryptedData = await encryptData(rawData, publicKey);

    // 🔹 クリップボードにコピー
    navigator.clipboard.writeText(encryptedData).then(() => {
        alert("プレイ履歴（RSA暗号化済み）をクリップボードにコピーしました！");
    }).catch(e => {
        console.error("コピー失敗", e);
        alert("コピー失敗");
    });
})();
