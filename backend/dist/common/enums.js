"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentStatus = exports.UserRole = void 0;
var UserRole;
(function (UserRole) {
    UserRole["STUDENT"] = "STUDENT";
    UserRole["KAFEDRA"] = "KAFEDRA";
    UserRole["DEKANAT"] = "DEKANAT";
    UserRole["ADMIN"] = "ADMIN";
})(UserRole || (exports.UserRole = UserRole = {}));
var DocumentStatus;
(function (DocumentStatus) {
    DocumentStatus["PENDING"] = "PENDING";
    DocumentStatus["KAFEDRA_APPROVED"] = "KAFEDRA_APPROVED";
    DocumentStatus["DEKANAT_APPROVED"] = "DEKANAT_APPROVED";
    DocumentStatus["REJECTED"] = "REJECTED";
})(DocumentStatus || (exports.DocumentStatus = DocumentStatus = {}));
//# sourceMappingURL=enums.js.map