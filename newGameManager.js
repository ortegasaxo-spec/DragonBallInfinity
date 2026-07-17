(function (global) {

class NewGameManager {

    constructor() {

        this.STORAGE_KEY = "dbi_newgame_v1";

        this.data = {
            infinityUnlocked: false,
            storyUnlocked: false,
            maxCycle: 1,
            selectedCycle: 1
        };

        this.load();
    }

    load() {

        try {

            const saved = JSON.parse(
                localStorage.getItem(this.STORAGE_KEY)
            );

            if (saved) {

                this.data = Object.assign(
                    this.data,
                    saved
                );

            }

        } catch (e) {}

    }

    save() {

        localStorage.setItem(
            this.STORAGE_KEY,
            JSON.stringify(this.data)
        );

    }

    unlockInfinity() {

        if (!this.data.infinityUnlocked) {

            this.data.infinityUnlocked = true;
            this.save();

        }

    }

    unlockStory() {

        if (!this.data.storyUnlocked) {

            this.data.storyUnlocked = true;
            this.save();

        }

    }

    isInfinityUnlocked() {

        return this.data.infinityUnlocked;

    }

    isStoryUnlocked() {

        return this.data.storyUnlocked;

    }

    getMaxCycle() {

        return Math.max(1, this.data.maxCycle);

    }

    unlockCycle(cycle) {

        cycle = Math.max(1, cycle | 0);

        if (cycle > this.data.maxCycle) {

            this.data.maxCycle = cycle;
            this.save();

        }

    }

    advanceCycle() {

    const current = this.getSelectedCycle();

    if (current >= this.data.maxCycle) {

        this.unlockCycle(current + 1);

    }

}

    getAvailableCycles() {

        

        const list = [];

        for (let i = 1; i <= this.getMaxCycle(); i++) {

            list.push(i);

        }

        return list;

    }

    hasUnlockedNewGame(mode = "infinity") {

    if (mode === "story") {
        return this.isStoryUnlocked();
    }

    return this.isInfinityUnlocked();

}

shouldShowCycleSelector(mode = "infinity") {

    return this.hasUnlockedNewGame(mode) &&
           this.getMaxCycle() > 1;

}

    setSelectedCycle(cycle) {

        cycle = Math.max(
            1,
            Math.min(
                cycle | 0,
                this.getMaxCycle()
            )
        );

        this.data.selectedCycle = cycle;

        this.save();

    }

    getSelectedCycle() {

        return this.data.selectedCycle || 1;

    }

    getCycleName(cycle = this.getSelectedCycle()) {

    if (cycle === 1) return "NG";
    if (cycle === 2) return "NG+";

    return "NG+" + (cycle - 1);

}

getCycleLabel(cycle = this.getSelectedCycle()) {

    return {

        name: this.getCycleName(cycle),

        bonus: Math.max(0, (cycle - 1) * 10)

    };

}

    getCycleBonusPercent() {

        return Math.max(
            0,
            (this.getSelectedCycle() - 1) * 10
        );

    }

    calculateCycleBonus(baseZenis) {

        return Math.floor(

            baseZenis *

            (this.getCycleBonusPercent() / 100)

        );

    }

    reset() {

        this.data = {

            infinityUnlocked: false,
            storyUnlocked: false,
            maxCycle: 1,
            selectedCycle: 1

        };

        this.save();

    }

}

global.newGameManager = new NewGameManager();

window.ngUnlock = function(cycle = 2){

    newGameManager.unlockInfinity();

    newGameManager.unlockStory();

    newGameManager.unlockCycle(cycle);

    newGameManager.setSelectedCycle(cycle);

    console.log(newGameManager.data);

};

window.ngReset = function(){

    newGameManager.reset();

    console.log(newGameManager.data);

};

})(window);