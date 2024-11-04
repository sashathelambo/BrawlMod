function generateRandomOP() {
    if (!BrawlStarsEditor.currentFileName.includes('skills')) {
        alert('Current file is not a skills file.');
        return;
    }

    const rowIndexes = prompt('Enter the row numbers to generate OP stats (comma-separated):');
    if (rowIndexes !== null) {
        const rows = rowIndexes.split(',').map(row => parseInt(row.trim())).filter(row => !isNaN(row) && row > 0 && row < BrawlStarsEditor.data[BrawlStarsEditor.currentFileName].length);

        rows.forEach(rowIndex => {
            const maxBulletLimit = parseInt(document.getElementById('max-bullet-limit').value);
            const useAverageSpeed = document.getElementById('average-speed-checkbox').checked;
            let projectileSpeed = parseInt(document.getElementById('projectile-speed').value);

            if (useAverageSpeed) {
                let totalSpeed = 0;
                let count = 0;
                for (const key in projectileData) {
                    if (projectileData.hasOwnProperty(key)) {
                        totalSpeed += parseFloat(projectileData[key].Speed);
                        count++;
                    }
                }
                projectileSpeed = totalSpeed / count;
            }

            const row = BrawlStarsEditor.data[BrawlStarsEditor.currentFileName][rowIndex];
            const activeTime = getRandomInt(10, 500);
            const cooldown = getRandomInt(1, 10);
            const msBetweenAttacks = getRandomInt(1, 25);
            const maxAttacks = Math.floor(activeTime / msBetweenAttacks);

            let projectileRange = getRandomInt(50, 200);
            const timeToDisappear = projectileRange / projectileSpeed;

            let numBullets = getRandomInt(1, Math.min(50, Math.floor(maxBulletLimit / maxAttacks)));
            const adjustedMaxAttacks = Math.min(maxAttacks, Math.floor(timeToDisappear / msBetweenAttacks));

            if (!enableMoreBullets && numBullets * adjustedMaxAttacks > maxBulletLimit) {
                numBullets = Math.floor(maxBulletLimit / adjustedMaxAttacks);
            }

            const damagePerBullet = getRandomInt(100, Math.floor(10000 / numBullets));

            row.forEach((cell, colIndex) => {
                if (cell === '') {
                    return;
                }
                switch (BrawlStarsEditor.data[BrawlStarsEditor.currentFileName][0][colIndex]) {
                    case 'Cooldown':
                        row[colIndex] = cooldown.toString();
                        break;
                    case 'ActiveTime':
                        row[colIndex] = activeTime.toString();
                        break;
                    case 'CastingRange':
                        row[colIndex] = projectileRange.toString();
                        break;
                    case 'RechargeTime':
                        row[colIndex] = '1';
                        break;
                    case 'MaxCharge':
                        row[colIndex] = '9999';
                        break;
                    case 'Damage':
                        row[colIndex] = damagePerBullet.toString();
                        break;
                    case 'MsBetweenAttacks':
                        row[colIndex] = msBetweenAttacks.toString();
                        break;
                    case 'Spread':
                        row[colIndex] = '180';
                        break;
                    case 'NumBulletsInOneAttack':
                        if (enableMoreBullets) {
                            row[colIndex] = numBullets.toString();
                        }
                        break;
                    case 'HoldToShoot':
                        row[colIndex] = 'true';
                        break;
                }
            });

            if (!validateStats(row, maxBulletLimit, projectileSpeed)) {
                alert(`Generated stats for row ${rowIndex} exceed the max bullet limit. Please try again.`);
            }
        });

        populateTable();
        saveData();
    } else {
        alert('Invalid row number.');
    }
}

function validateStats(row, maxBulletLimit, projectileSpeed) {
    const msBetweenAttacks = parseInt(row[BrawlStarsEditor.data[BrawlStarsEditor.currentFileName][0].indexOf('MsBetweenAttacks')]);
    const numBullets = parseInt(row[BrawlStarsEditor.data[BrawlStarsEditor.currentFileName][0].indexOf('NumBulletsInOneAttack')]);
    const activeTime = parseInt(row[BrawlStarsEditor.data[BrawlStarsEditor.currentFileName][0].indexOf('ActiveTime')]);
    const projectileRange = parseFloat(row[BrawlStarsEditor.data[BrawlStarsEditor.currentFileName][0].indexOf('CastingRange')]);
    const timeToDisappear = projectileRange / projectileSpeed;

    const maxAttacks = Math.floor(activeTime / msBetweenAttacks);
    const adjustedMaxAttacks = Math.min(maxAttacks, Math.floor(timeToDisappear / msBetweenAttacks));
    const totalBullets = adjustedMaxAttacks * numBullets;

    return totalBullets <= maxBulletLimit;
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
