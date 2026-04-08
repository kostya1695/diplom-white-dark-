// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract DiplomaRegistry {
    enum DocumentStatus {
        NONE,
        UPLOADED,
        UNDER_REVIEW,
        APPROVED_DEPARTMENT,
        APPROVED_DEAN,
        REGISTERED
    }

    struct DocumentRecord {
        string documentId;
        bytes32 hash;
        address issuer;
        uint256 timestamp;
        DocumentStatus status;
        bool exists;
    }

    mapping(string => DocumentRecord) private documents;

    event StageLogged(
        string indexed documentId,
        bytes32 indexed hash,
        address indexed actor,
        DocumentStatus status,
        uint256 timestamp
    );

    event DocumentRegistered(
        string indexed documentId,
        bytes32 indexed hash,
        address indexed issuer,
        uint256 timestamp
    );

    /// Промежуточные действия для аудита (не обязательно хранить состояние)
    event ActionEmitted(
        string indexed documentId,
        string actionType,
        address indexed actor,
        uint256 timestamp
    );

    function emitActionEvent(string calldata documentId, string calldata actionType) external {
        require(bytes(documentId).length > 0, "documentId required");
        require(bytes(actionType).length > 0, "actionType required");
        emit ActionEmitted(documentId, actionType, msg.sender, block.timestamp);
    }

    function logEvent(
        string calldata documentId,
        bytes32 hash,
        DocumentStatus status
    ) external {
        require(bytes(documentId).length > 0, "documentId required");
        require(status != DocumentStatus.NONE, "invalid status");

        DocumentRecord storage record = documents[documentId];
        if (!record.exists) {
            record.documentId = documentId;
            record.hash = hash;
            record.issuer = msg.sender;
            record.timestamp = block.timestamp;
            record.status = status;
            record.exists = true;
        } else {
            record.hash = hash;
            record.status = status;
            record.timestamp = block.timestamp;
        }

        emit StageLogged(documentId, hash, msg.sender, status, block.timestamp);
    }

    function registerDocument(string calldata documentId, bytes32 hash) external {
        require(bytes(documentId).length > 0, "documentId required");

        DocumentRecord storage record = documents[documentId];
        record.documentId = documentId;
        record.hash = hash;
        record.issuer = msg.sender;
        record.timestamp = block.timestamp;
        record.status = DocumentStatus.REGISTERED;
        record.exists = true;

        emit DocumentRegistered(documentId, hash, msg.sender, block.timestamp);
    }

    function verifyDocument(string calldata documentId, bytes32 hash) external view returns (bool) {
        DocumentRecord storage record = documents[documentId];
        return record.exists && record.status == DocumentStatus.REGISTERED && record.hash == hash;
    }

    function getDocument(string calldata documentId) external view returns (DocumentRecord memory) {
        return documents[documentId];
    }
}
