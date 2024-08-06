const TicketService = require("../services/TicketService");
const PaginatedTicketDTO = require("../dtos/PaginatedTicketDTO");
const APIError = require("../services/errors/APIError");
const { sendSuccess, buildQueryString } = require("./ControllerUtils");

async function getTicketsPaginated(req, res, next) {
  try {
    const url = req.baseUrl + req.path;
    const result = await TicketService.getTicketsPaginated(req.query);
    result.prevLink = !result.prevPage
      ? null
      : buildQueryString(req.query, `${url}`, {
          page: result.prevPage,
        });
    result.nextLink = !result.nextPage
      ? null
      : buildQueryString(req.query, `${url}`, {
          page: result.nextPage,
        });
    sendSuccess(res, new PaginatedTicketDTO(result));
  } catch (error) {
    next(error);
  }
}

async function getUserTicketsPaginated(req, res, next) {
  try {
    const userEmail = req.params.userEmail?.trim()?.toLowerCase();
    if (req.user.email != userEmail && req.user.role != "admin") {
      throw new APIError("Not authorized to get other people's tickets");
    }
    const url = req.baseUrl + req.path;
    const result = await TicketService.getUserTicketsPaginated(
      userEmail,
      req.query,
    );
    result.prevLink = !result.prevPage
      ? null
      : buildQueryString(req.query, `${url}`, {
          page: result.prevPage,
        });
    result.nextLink = !result.nextPage
      ? null
      : buildQueryString(req.query, `${url}`, {
          page: result.nextPage,
        });
    sendSuccess(res, new PaginatedTicketDTO(result));
  } catch (error) {
    next(error);
  }
}

module.exports = { getTicketsPaginated, getUserTicketsPaginated };
