/**
 * Wrapper para funções async em Express
 * Elimina a necessidade de try/catch em cada controller
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
