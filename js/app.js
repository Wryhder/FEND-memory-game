"use strict";

// Global variables
const deck = document.querySelector('.deck'),
    cards = document.querySelectorAll('.deck li'),
    resetButton = document.querySelector('.fa-redo'),
    modalCloseButton = document.querySelector('.modal-close'),
    modalCancelButton = document.querySelector('.cancel'),
    modalReplayButton = document.querySelector('.replay'),
    gemsDisplay = document.querySelector('.lives'),
    gemsStatsonGameBoard = document.querySelector('.match-modal-format'),
    totalCardPairs = 18;

let openCards = [],
    moves = 0,
    time = 0,
    timerId,
    timerOff = true,
    isGameOver = false,
    matchedCards = 0,
    totalPlayTime = 0,
    totalMoves = 0,
    gemsLeft = 0;


// Object `chores` contain all handler functions for the game
const chores = {

    // shuffles card deck
    setUpDeck() {
        // Global cards variable contains a nodeList;
        // it need to be converted to an array before it is looped over
        // This is what the Array.from() function achieves
        const allCardsOnDeck = Array.from(cards);

        // The IIFE (Immediately Invoked Function Expression), `shuffle`,
        // performs the actual card shuffling and returns shuffled cards
        const shuffledCards = (function shuffle(array) {
            let currentIndex = array.length, temporaryValue, randomIndex;

            while (currentIndex !== 0) {
                randomIndex = Math.floor(Math.random() * currentIndex);
                currentIndex -= 1;
                temporaryValue = array[currentIndex];
                array[currentIndex] = array[randomIndex];
                array[randomIndex] = temporaryValue;
            }

            return array;
        })(allCardsOnDeck);

        // Appends shuffled cards to the main deck
        for (let card of shuffledCards) {
            deck.appendChild(card);
        }
    },

    // Set up event listeners
    setUpListeners() {
        deck.addEventListener('click', this.manageGamePlay.bind(chores));

        resetButton.addEventListener('click', this.resetGame.bind(chores));

        modalCloseButton.addEventListener('click', this.toggleModal.bind(chores));

        modalCancelButton.addEventListener('click', this.toggleModal.bind(chores));

        modalReplayButton.addEventListener('click', this.resetGame.bind(chores));
    },
    
    manageGamePlay() {
        const clickTarget = event.target;

        // if a click is valid and it is the first of such, start the timer
        if (this.checkClickValidity(clickTarget)) {
            if (timerOff) {
                this.handleTimer();
                timerOff = false;
            }

            // if a click is valid, turn its target (the card) face up
            this.toggleClass(clickTarget);
            // add card to the openCards array
            this.addToArray(clickTarget);

            // only accept two cards max in openCards array
            if (openCards.length === 2) {
                this.checkForMatch();
                
                // Whether or not cards match, increase the moves counter
                // and check if a gem should be removed
                if (!isGameOver) {
                    this.handleMoves();
                    this.handleScoring();
                }
            }
        }
    },

    checkClickValidity(clickTarget) {
        // For a click to be valid:
        // 1. Target needs to be a card with class of "card"
        // 2. Target must not have been previously matched
        // 3. The openCards array must have less than two cards already in it
        // 4. Target must not already be in the openCards array
        return (
            clickTarget.classList.contains('card') &&
            !clickTarget.classList.contains('match') &&
            openCards.length < 2 &&
            !openCards.includes(clickTarget)
        );
    },

    // open or close a card
    toggleClass(card) {
        card.classList.toggle('open');
        card.classList.toggle('show');
    },

    // add a card to the openCards array
    addToArray(card) {
        openCards.push(card);
    },

    // empty the openCards array
    emptyArray() {
        openCards = [];
    },

    // checks if two cards match, that is, share the same symbols or classList
    // if they do leave 'em open, else turn them over
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

                    // these calls here stop the counters on the score panel
                    // once all cards are matched
                    // as well as toggle the game completion modal on
                    chores.handleTimer();
                    chores.handleMoves();
                    chores.handleScoring();
                    chores.toggleModal();
                })();
            }
        } else {
            // turns unmatched cards back down
            // but not before player can see they were not a match
            setTimeout(() => {
                this.closeUnmatchedCards();
                this.emptyArray();
            }, 1000);
        }
    },

    leaveMatchedCardsOpen() {
        // the "match" class keeps the matched cards open
        openCards[0].classList.toggle('match');
        openCards[1].classList.toggle('match');
    },

    // turn unmatched cards back down
    closeUnmatchedCards() {
        this.toggleClass(openCards[0]);
        this.toggleClass(openCards[1]);
    },

    handleMoves() {
        // Each time two cards are opened, the moves
        // variable is increased by one and displayed
        // on the score panel
        moves++;
        const movesElement = document.querySelector('.moves');
        movesElement.innerHTML = `Moves: ${moves}`;
        
        if (isGameOver === true) {
            totalMoves = moves;

            // Resets the number of moves when game is over or reset
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

        // Checks when a gem should be removed
        if (moves === 14 || moves === 20 || moves === 30) {
            (function hideGem() {
                for (let gem of gemList) {
                    if (!gem.classList.contains('hidden')) {
                        gem.classList.toggle('hidden');
                        break;
                    }
                }
            })();
        }

        if (isGameOver === true) {

            // Get the number of gems left
            gemsLeft = (function getGemsLeft() {
                let gemCount = 0;

                for (let gem of gemList) {
                    if (!gem.classList.contains('.hidden')) {
                        gemCount++;
                    }
                }

                return gemCount;
            })();

            // hide element stored in the gemsDisplay variable
            // and show the element stored in the gemsStatsonGameBoard variable
            // What this actually does is unhide the html element
            // which shows the final rating (or gems left)
            // in the same numeric format as the game completion modal
            gemsStatsonGameBoard.innerHTML = `Gems: ${gemsLeft}`;
            gemsDisplay.classList.toggle('hidden');
            gemsStatsonGameBoard.classList.toggle('hidden');

            // Resets the number of gems when game is over or reset
            (function resetGems() {

                // When modal is toggled on, keep showing gems left
                // in background score panel until replay button is clicked
                // The extra check for the resetButton ensures that
                // expected behaviour is retained
                if (event.target === modalReplayButton ||
                    event.target === resetButton) {

                    for (const gem of gemList) {
                        if (gem.classList.contains('hidden')) {
                            gem.classList.toggle('hidden');
                        }
                    }
                }
            })();

        }
    },

    handleTimer() {
        const timer = document.querySelector('.timer');

        // Stops the timer when game is over or reset
        // and resets the all variables concerned with time 
        if (isGameOver === true) {
            (function stopTimer() {
                clearInterval(timerId);
            })();

            timerOff = true;
            time = 0;
            // get total play time
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
            // Start the timer and make sure the time displayed
            // on the score panel stays recent
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

        // if modal was hidden at the time the `toggleModal` method was called
        // then that means the game has just ended
        if (modal.classList.contains('hidden')) {
            isGameOver = true;

            // write all game stats to the modal HTML element
            (function writeModalStats() {
                const timeStat = document.querySelector('.total-time');
                const movesStat = document.querySelector('.number-of-moves');
                const gemsStat = document.querySelector('.gems-left');

                timeStat.innerHTML = `Time = ${totalPlayTime}`;
                movesStat.innerHTML = `Moves = ${totalMoves}`;
                gemsStat.innerHTML = `Gems = ${gemsLeft}`;
            })();
        }

        // show/hide the modal
        modal.classList.toggle('hidden');
    },

    resetGame() {
        // Without this check here the counters on the score panel
        // exhibit a weird behaviour where they start reading
        // even though the game has not begun
        if (event.target === resetButton) {
            isGameOver = true;
        }

        // show element stored in the gemsDisplay variable
        // and hide the element stored in the gemsStatsonGameBoard variable
        // or at least that is what is supposed to happen and it works
        // I just don't understand how
        if (gemsStatsonGameBoard.classList.contains('hidden') === true) {
            gemsStatsonGameBoard.classList.toggle('hidden');
        }
        if (gemsDisplay.classList.contains('hidden') === false) {
            gemsDisplay.classList.toggle('hidden');
        }

        // these reset the counters on the score panel
        this.handleTimer();
        this.handleMoves();
        this.handleScoring();
        
        // only show the modal if the modalReplayButton,
        // and not the resetButton, was clicked;
        // resetButton was not created with a <button> tag
        if (event.target.tagName === 'BUTTON') {
            this.toggleModal();
        }

        // shuffle the deck
        this.setUpDeck();

        // reset variable
        isGameOver = false;

        // remove all classes from cards and leave just the "card" class
        (function resetCards() {
            for (let card of cards) {
                card.className = 'card';
            }
        })();
    },
}

// on each new page load, shuffle the deck, set up appropriate listeners
chores.setUpDeck();
chores.setUpListeners();

