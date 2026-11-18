export const clearSessionTurno = () => {
  localStorage.removeItem('sessionTurno');
  localStorage.removeItem('sessionCloseAt');
};

export const getSessionTurno = (): string | null => {
  return localStorage.getItem('sessionTurno');
};

export const getSessionCloseAt = (): number => {
  return Number(localStorage.getItem('sessionCloseAt')) || 0;
};