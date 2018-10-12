"use strict"

const deck = document.querySelector('.deck'),
    cards = document.querySelectorAll('.deck li'),
    resetButton = document.querySelector('.fa-redo'),
    modalCloseButton = document.querySelector('.modal-close'),
    modalCancelButton = document.querySelector('.cancel'),
    modalReplayButton = document.querySelector('.replay'),
    totalCardPairs = 18;

let openCards = [],
    moves = 0,
    time = 0,
    timerId,
    timerOff = true,
    isGameOver = false,
    matchedCards = 0
    totalPlayTime = 0,
    totalMoves = 0,
    gemsLeft = 0;
 
const chores = {

    shuffleDeck() {
        const allCardsOnDeck = Array.from(cards);

        const shuffledCards = (function shuffle(array) {
            var currentIndex = array.length, temporaryValue, randomIndex;

            while (currentIndex !== 0) {
                randomIndex = Math.floor(Math.random() * currentIndex);
                currentIndex -= 1;
                temporaryValue = array[currentIndex];
                array[currentIndex] = array[randomIndex];
                array[randomIndex] = temporaryValue;
            }

            return array;
        })(allCardsOnDeck);

        for (card of shuffledCards) {
            deck.appendChild(card);
        }
    },

    setUpListeners() {
        deck.addEventListener('click', this.manageGamePlay.bind(chores));

        resetButton.addEventListener('click', this.resetGame.bind(chores));

        modalCloseButton.addEventListener('click', this.toggleModal.bind(chores));

        modalCancelButton.addEventListener('click', this.toggleModal.bind(chores));

        modalReplayButton.addEventListener('click', this.resetGame.bind(chores));
    },

    manageGamePlay() {
        const clickTarget = event.target;

        if (this.checkClickValidity(clickTarget)) {
            if (timerOff) {
                this.handleTimer();
                timerOff = false;
            }

            this.toggleClass(clickTarget);
            this.addToArray(clickTarget);

            if (openCards.length === 2) {
                this.checkForMatch();
                
                if (!isGameOver) {
                    this.handleMoves();
                    this.handleScoring();
                }
            }
        }
    },

    checkClickValidity(clickTarget) {
        return (
            clickTarget.classList.contains('card') &&
            !clickTarget.classList.contains('match') &&
            openCards.length < 2 &&
            !openCards.includes(clickTarget)
        );
    },

    toggleClass(card) {
        card.classList.toggle('open');
        card.classList.toggle('show');
    },

    addToArray(card) {
        openCards.push(card);
    },

    emptyArray() {
        openCards = [];
    },

    checkForMatch() {
        if (openCards[0].firstElementChild.className ===
            openCards[1].firstElementChild.className) {
            this.leaveMatchedCardsOpen();
            matchedCards++;
            this.emptyArray();

            if (matchedCards === totalCardPairs) {
                (function gameOver() {
                    isGameOver = true;
                    matchedCards = 0;

                    chores.handleTimer();
                    chores.handleMoves();
                    chores.handleScoring();
                    chores.toggleModal();
                })();
            }
        } else {
            setTimeout(() => {
                this.closeUnmatchedCards();
                this.emptyArray();
            }, 1000);
        }
    },

    leaveMatchedCardsOpen() {
        openCards[0].classList.toggle('match');
        openCards[1].classList.toggle('match');
    },

    closeUnmatchedCards() {
        this.toggleClass(openCards[0]);
        this.toggleClass(openCards[1]);
    },

    handleMoves() {
        moves++;
        movesElement = document.querySelector('.moves');
        movesElement.innerHTML = `Moves: ${moves}`;
        
        if (isGameOver === true) {
            totalMoves = moves;

            (function resetMoves() {
                moves = 0;

                // When modal is toggled on, keep showing total moves
                // in background score panel until replay button is clicked;
                // The extra check for the resetButton ensures that
                // expected behaviour is retained
                if (event.target === modalReplayButton ||
                    event.target === resetButton) {
                    movesElement.innerHTML = `Moves: ${moves}`;
                    }
            })();
            
        }
    },

    handleScoring() {
        const gemList = document.querySelectorAll('.gems li');

        if (moves === 14 || moves === 20 || moves === 30) {
            (function hideGem() {
                for (gem of gemList) {
                    if (!gem.classList.contains('hidden')) {
                        gem.classList.toggle('hidden');
                        break;
                    }
                }
            })();
        }

        if (isGameOver === true) {

            gemsLeft = (function getGemsLeft() {
                let gemCount = 0;

                for (gem of gemList) {
                    if (!gem.classList.contains('.hidden')) {
                        gemCount++;
                    }
                }

                return gemCount;
            })();

            (function resetGems() {
                gems = 0;

                // When modal is toggled on, keep showing gems left
                // in background score panel until replay button is clicked
                // The extra check for the resetButton ensures that
                // expected behaviour is retained
                if (event.target === modalReplayButton ||
                    event.target === resetButton) {

                    for (gem of gemList) {
                        if (gem.classList.contains('hidden')) {
                            gem.classList.toggle('hidden');
                        }
                    }
                }
            })();

        } else {

            
        }
    },

    handleTimer() {
        const timer = document.querySelector('.timer');

        if (isGameOver === true) {
            (function stopTimer() {
                clearInterval(timerId);
            })();

            timerOff = true;
            time = 0;
            totalPlayTime = timer.innerHTML.split(' ')[1];
            
            // When modal is toggled on, keep showing total play time
            // in background score panel until replay button is clicked
            // The extra check for the resetButton ensures that
            // expected behaviour is retained
            
            if (event.target === modalReplayButton ||
                event.target === resetButton) {

                timer.innerHTML = `Time: 00:00`;
            }

        } else {
            (function startTimer() {
                timerId = setInterval(() => {
                    time++;

                    (function displayTimer() {
                        const minutes = Math.floor(time / 60);
                        const seconds = time % 60;

                        if (seconds < 10) {
                            timer.innerHTML = `Time: ${minutes}:0${seconds}`;
                        } else {
                            timer.innerHTML = `Time: ${minutes}:${seconds}`;
                        }
                    })();

                }, 1000);
            })();
        }
    },

    toggleModal() {
        const modal = document.querySelector('.game-completion-modal');

        if (modal.classList.contains('hidden')) {
            isGameOver = true;

            (function writeModalStats() {
                const timeStat = document.querySelector('.total-time');
                const movesStat = document.querySelector('.number-of-moves');
                const gemsStat = document.querySelector('.gems-left');

                timeStat.innerHTML = `Time = ${totalPlayTime}`;
                movesStat.innerHTML = `Moves = ${totalMoves}`;
                gemsStat.innerHTML = `Gems = ${gemsLeft}`;
            })();
        }

        modal.classList.toggle('hidden');
    },

    resetGame() {
        // Without this check here the counters on the score panel
        // exhibit a weird behaviour where they start reading
        // even though the game has not begun
        if (event.target === resetButton) {
            isGameOver = true;
        }

        this.handleTimer();
        this.handleMoves();
        this.handleScoring();
        
        if (event.target.tagName === 'BUTTON') {
            this.toggleModal();
        }

        this.shuffleDeck();
        isGameOver = false;

        (function resetCards() {
            for (card of cards) {
                card.className = 'card';
            }
        })();
    },
}

chores.shuffleDeck();
chores.setUpListeners();

