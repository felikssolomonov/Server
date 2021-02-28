module.exports = function (req: any, res: any, next: Function) {
  res.locals.isAuth = req.session.isAuthentificated;
  // res.locals.csurf = req.csrfToken();
  next();
};
