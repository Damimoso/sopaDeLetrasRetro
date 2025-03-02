export function startTimer(timerElement, timeLeft, onTimeUp, updateTimerBar) {
    const intervalId = setInterval(() => {
        if (timeLeft > 0) {
            timeLeft--;
            timerElement.textContent = `Tiempo: ${timeLeft}s`;
            updateTimerBar(timeLeft);

            if (timeLeft <= 10) {
                timerElement.style.color = 'red';
                timerElement.style.animation = 'blink 1s infinite';
            }
        } else {
            clearInterval(intervalId);
            if (onTimeUp) onTimeUp();
        }
    }, 1000);

    return intervalId;
}

export function resetTimer(timerElement, timeLeft, timerBar) {
    timerElement.textContent = `Tiempo: ${timeLeft}s`;
    timerBar.value = timeLeft;
    timerElement.style.color = '';
    timerElement.style.animation = '';
}