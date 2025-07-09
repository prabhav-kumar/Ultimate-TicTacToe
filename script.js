document.addEventListener('DOMContentLoaded', function() {
  // Page elements
  const landingPageSection = document.getElementById('landing-page');
  const normalGameSection = document.getElementById('normal-ttt');
  const ultimateGameSection = document.getElementById('ultimate-ttt');
  const normalGameButton = document.getElementById('normal-btn');
  const ultimateGameButton = document.getElementById('ultimate-btn');
  const backButtons = document.querySelectorAll('.back-btn');

  // Show only the selected page/section
  function showSection(section) {
    landingPageSection.style.display = 'none';
    normalGameSection.style.display = 'none';
    ultimateGameSection.style.display = 'none';
    section.style.display = 'flex';
  }

  // Navigation event listeners
  normalGameButton.addEventListener('click', () => {
    showSection(normalGameSection);
    startNormalTicTacToe();
  });
  ultimateGameButton.addEventListener('click', () => {
    showSection(ultimateGameSection);
    startUltimateTicTacToe();
  });
  backButtons.forEach(btn => btn.addEventListener('click', () => showSection(landingPageSection)));

  // --- Normal Tic Tac Toe Logic ---
  function startNormalTicTacToe() {
    const boardContainer = document.getElementById('normal-board');
    const messageContainer = document.getElementById('normal-message');
    boardContainer.innerHTML = '';
    messageContainer.innerHTML = '';

    let boardSquares = Array(9).fill(null); // 3x3 board
    let currentPlayer = 'X';
    let isGameOver = false;
    let winningLine = null;

    // Render the board and update UI
    function renderBoard() {
      boardContainer.innerHTML = '';
      for (let squareIndex = 0; squareIndex < 9; squareIndex++) {
        const squareDiv = document.createElement('div');
        squareDiv.className = 'square' + (boardSquares[squareIndex] ? ' ' + boardSquares[squareIndex].toLowerCase() : '');
        squareDiv.textContent = boardSquares[squareIndex] || '';
        if (winningLine && winningLine.includes(squareIndex)) squareDiv.classList.add('winner');
        squareDiv.addEventListener('click', () => handleSquareClick(squareIndex));
        boardContainer.appendChild(squareDiv);
      }
      if (winningLine) drawWinningLine(winningLine, boardContainer, 'normal');
    }

    // Handle a player's move
    function handleSquareClick(squareIndex) {
      if (boardSquares[squareIndex] || isGameOver) return;
      boardSquares[squareIndex] = currentPlayer;
      const winnerInfo = getWinner(boardSquares);
      if (winnerInfo) {
        isGameOver = true;
        winningLine = winnerInfo.line;
        renderBoard();
        messageContainer.innerHTML = `<div class="big-message">${winnerInfo.player} wins!</div>`;
        return;
      } else if (boardSquares.every(Boolean)) {
        isGameOver = true;
        messageContainer.innerHTML = `<div class="big-message">It's a Tie!</div>`;
      } else {
        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
        messageContainer.textContent = `It's ${currentPlayer}'s turn`;
      }
      renderBoard();
    }

    messageContainer.textContent = `It's X's turn`;
    renderBoard();
  }

  // --- Ultimate Tic Tac Toe Logic ---
  function startUltimateTicTacToe() {
    const mainBoardContainer = document.getElementById('ultimate-board');
    const messageContainer = document.getElementById('ultimate-message');
    mainBoardContainer.innerHTML = '';
    messageContainer.innerHTML = '';

    // 9 small boards, each with 9 squares
    let mainBoard = Array(9).fill().map(() => Array(9).fill(null));
    let smallBoardWinners = Array(9).fill(null); // X, O, Tie, or null
    let currentPlayer = 'X';
    let isGameOver = false;
    let activeSmallBoard = null; // 0-8 or null (any)
    let bigBoardWinningLine = null;

    // Render the main board and update UI
    function renderMainBoard() {
      mainBoardContainer.innerHTML = '';
      for (let smallBoardIndex = 0; smallBoardIndex < 9; smallBoardIndex++) {
        const smallBoardDiv = document.createElement('div');
        smallBoardDiv.className = 'ultimate-small-board';
        if (activeSmallBoard === smallBoardIndex && !smallBoardWinners[smallBoardIndex] && !isGameOver) smallBoardDiv.classList.add('active');
        if (smallBoardWinners[smallBoardIndex] === 'X') smallBoardDiv.classList.add('won-x');
        if (smallBoardWinners[smallBoardIndex] === 'O') smallBoardDiv.classList.add('won-o');
        if (smallBoardWinners[smallBoardIndex] === 'Tie') smallBoardDiv.classList.add('tie');
        smallBoardDiv.dataset.board = smallBoardIndex;
        for (let squareIndex = 0; squareIndex < 9; squareIndex++) {
          const squareDiv = document.createElement('div');
          squareDiv.className = 'ultimate-square' + (mainBoard[smallBoardIndex][squareIndex] ? ' ' + mainBoard[smallBoardIndex][squareIndex].toLowerCase() : '');
          squareDiv.textContent = mainBoard[smallBoardIndex][squareIndex] || '';
          if (Array.isArray(smallBoardWinners[smallBoardIndex]) && smallBoardWinners[smallBoardIndex].includes(squareIndex)) squareDiv.classList.add('winner');
          squareDiv.addEventListener('click', () => handleUltimateSquareClick(smallBoardIndex, squareIndex));
          smallBoardDiv.appendChild(squareDiv);
        }
        mainBoardContainer.appendChild(smallBoardDiv);
      }
      if (bigBoardWinningLine) drawWinningLine(bigBoardWinningLine, mainBoardContainer, 'ultimate');
    }

    // Handle a player's move in Ultimate Tic Tac Toe
    function handleUltimateSquareClick(smallBoardIndex, squareIndex) {
      if (isGameOver) return;
      if (smallBoardWinners[smallBoardIndex]) return;
      if (activeSmallBoard !== null && smallBoardIndex !== activeSmallBoard) return;
      if (mainBoard[smallBoardIndex][squareIndex]) return;
      mainBoard[smallBoardIndex][squareIndex] = currentPlayer;
      // Check for small board win
      const winnerInfo = getWinner(mainBoard[smallBoardIndex]);
      if (winnerInfo) {
        smallBoardWinners[smallBoardIndex] = winnerInfo.player;
      } else if (mainBoard[smallBoardIndex].every(Boolean)) {
        smallBoardWinners[smallBoardIndex] = 'Tie';
      }
      // Check for big board win
      const bigBoardWinnerInfo = getWinner(smallBoardWinners);
      if (bigBoardWinnerInfo) {
        isGameOver = true;
        bigBoardWinningLine = bigBoardWinnerInfo.line;
        renderMainBoard();
        messageContainer.innerHTML = `<div class="big-message">${bigBoardWinnerInfo.player} wins!</div>`;
        return;
      } else if (smallBoardWinners.filter(Boolean).length === 9) {
        isGameOver = true;
        messageContainer.innerHTML = `<div class="big-message">It's a Tie!</div>`;
      } else {
        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
        messageContainer.textContent = `It's ${currentPlayer}'s turn`;
      }
      // Set next active small board
      if (smallBoardWinners[squareIndex]) {
        activeSmallBoard = null; // Any
      } else {
        activeSmallBoard = squareIndex;
      }
      renderMainBoard();
    }

    messageContainer.textContent = `It's X's turn`;
    activeSmallBoard = null;
    renderMainBoard();
  }

  // --- Win Calculation Helper ---
  function getWinner(squares) {
    const winningLines = [
      [0,1,2],[3,4,5],[6,7,8], // rows
      [0,3,6],[1,4,7],[2,5,8], // columns
      [0,4,8],[2,4,6] // diagonals
    ];
    for (let line of winningLines) {
      const [a,b,c] = line;
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return { player: squares[a], line };
      }
    }
    return null;
  }

  // --- Win Line Drawing Helper ---
  function drawWinningLine(line, boardElement, mode) {
    // Remove any previous win lines
    const previousLine = boardElement.querySelector('.win-line');
    if (previousLine) previousLine.remove();
    // Calculate SVG line position
    let xStart, yStart, xEnd, yEnd, cellSize;
    if (mode === 'normal') {
      cellSize = 80; // match .ttt-board
    } else {
      cellSize = 90; // match .ultimate-board
    }
    // Map line index to cell center
    const cellCenters = [
      [cellSize*0+cellSize/2, cellSize*0+cellSize/2],
      [cellSize*1+cellSize/2, cellSize*0+cellSize/2],
      [cellSize*2+cellSize/2, cellSize*0+cellSize/2],
      [cellSize*0+cellSize/2, cellSize*1+cellSize/2],
      [cellSize*1+cellSize/2, cellSize*1+cellSize/2],
      [cellSize*2+cellSize/2, cellSize*1+cellSize/2],
      [cellSize*0+cellSize/2, cellSize*2+cellSize/2],
      [cellSize*1+cellSize/2, cellSize*2+cellSize/2],
      [cellSize*2+cellSize/2, cellSize*2+cellSize/2],
    ];
    [xStart, yStart] = cellCenters[line[0]];
    [xEnd, yEnd] = cellCenters[line[2]];
    // SVG overlay for win line
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.classList.add('win-line');
    svg.setAttribute('width', cellSize*3);
    svg.setAttribute('height', cellSize*3);
    svg.style.position = 'absolute';
    svg.style.left = '0';
    svg.style.top = '0';
    svg.style.pointerEvents = 'none';
    svg.innerHTML = `<line x1="${xStart}" y1="${yStart}" x2="${xEnd}" y2="${yEnd}" stroke="var(--win-line)" stroke-width="8" stroke-linecap="round">
      <animate attributeName="x2" from="${xStart}" to="${xEnd}" dur="0.5s" fill="freeze" />
      <animate attributeName="y2" from="${yStart}" to="${yEnd}" dur="0.5s" fill="freeze" />
    </line>`;
    boardElement.style.position = 'relative';
    boardElement.appendChild(svg);
  }
}); 