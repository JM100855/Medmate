pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Counters.sol";

contract EHRVault {
    using Counters for Counters.Counter;

    Counters.Counter private _recordIds;

    struct Record {
        uint256 id;
        address recordAddress;
        string metadata;
        string name;
        string ipfs;
        string patientUid;
    }

    mapping (uint256 => Record) private records;

    event RecordAdded(uint256 indexed id);

    function addRecord(Record memory _record) public returns (uint256) {
        _recordIds.increment();

        uint256 newRecordId = _recordIds.current();
        Record memory record = Record(newRecordId, _record.recordAddress, _record.metadata, _record.name, _record.ipfs, _record.patientUid);

        records[newRecordId] = record;

        emit RecordAdded(newRecordId);

        return newRecordId;
    }

    function getRecord(uint256 id) public view returns (Record memory) {
        return records[id];
    }

    function totalRecords() public view returns (uint256) {
        return _recordIds.current();
    }

    function getRecordsByPatientId(string memory patientUid) public view returns (Record[] memory) {
        Record[] memory patientRecords = new Record[](_recordIds.current());
        uint256 patientRecordsCount = 0;

        for (uint256 i = 1; i <= _recordIds.current(); i++) {
            if (keccak256(abi.encodePacked(records[i].patientUid)) == keccak256(abi.encodePacked(patientUid))) {
                patientRecords[patientRecordsCount] = records[i];
                patientRecordsCount++;
            }
        }

        return patientRecords;
    }

    function getRecordsByAddress (address recordAddress) public view returns (Record[] memory) {
        Record[] memory patientRecords = new Record[](_recordIds.current());
        uint256 patientRecordsCount = 0;

        for (uint256 i = 1; i <= _recordIds.current(); i++) {
            if (records[i].recordAddress == recordAddress) {
                patientRecords[patientRecordsCount] = records[i];
                patientRecordsCount++;
            }
        }

        return patientRecords;
    }

}