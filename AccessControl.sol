
pragma solidity 0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Context.sol";

abstract contract AccessProtected is Context, Ownable {
    mapping(address => bool) internal _doctors; // user address => doctor? mapping

    event DoctorAccessSet(address _doctor, bool _enabled);


    function setDoctorAccess(address doctor, bool enabled) public onlyOwner {
        _doctors[doctor] = enabled;
        emit DoctorAccessSet(doctor, enabled);
    }

    function batchSetDoctorAccess(address[] memory doctors, bool[] memory enabled)
    external
    onlyOwner
    {
        require(doctors.length == enabled.length, "Length mismatch");
        for (uint256 i = 0; i < doctors.length; i++) {
            setDoctorAccess(doctors[i], enabled[i]);
        }
    }


    function isDoctor(address doctor) public view returns (bool) {
        return _doctors[doctor];
    }

    modifier onlyDoctors() {
        require(
            _doctors[_msgSender()] || _msgSender() == owner(),
            "AccessProtected: Caller does not have Doctor or Owner Access"
        );
        _;
    }
}