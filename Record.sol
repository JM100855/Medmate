pragma solidity ^0.8.0;

import "./AccessControl.sol";

contract Record is AccessProtected {
    string private name;
    string private ipfs;

    constructor(string memory _name, string memory _ipfs) {
        name = _name;
        ipfs = _ipfs;
    }

    function getDetails() external view onlyDoctors returns (string memory, string memory) {
        return (name, ipfs);
    }
}