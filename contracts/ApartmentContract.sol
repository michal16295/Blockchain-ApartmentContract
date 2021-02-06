pragma solidity ^0.5.1;

contract ApartmentContract {
    uint256 public count = 0;

    enum Status {Cancelled, Finished, Active}

    struct Apartment {
        uint256 id;
        string name;
        uint256 totalSum;
        uint256 paidSum;
        address payable seller;
        Status status;
    }

    mapping(uint256 => Apartment) public apartments;

    event ContractCreated(
        uint256 id,
        string name,
        uint256 totalSum,
        uint256 paidSum,
        address seller,
        Status status
    );

    event ContractPayed(
        uint256 id,
        string name,
        uint256 totalSum,
        uint256 paidSum,
        address seller,
        Status status
    );

    event ContractFinished(uint256 id, string name, Status status);

    event ContractCancelled(uint256 id, string name, Status status);

    constructor() public {
        createContract(
            "Test contract",
            5,
            0x090ec50a3f1184251E1041E5310F0f324FBD908E
        );
    }

    function createContract(
        string memory _name,
        uint256 _totalSum,
        address payable _seller
    ) public {
        count++;
        apartments[count] = Apartment(
            count,
            _name,
            _totalSum,
            0,
            _seller,
            Status.Active
        );
        emit ContractCreated(
            count,
            _name,
            _totalSum,
            0,
            _seller,
            Status.Active
        );
    }

    function addPayment(uint256 _id) public payable {
        require(_id <= count);
        require(apartments[_id].status == Status.Active);
        apartments[_id].paidSum += msg.value;
        apartments[_id].seller.transfer(msg.value);
        if (apartments[_id].paidSum >= apartments[_id].totalSum)
            setFinished(_id);

        emit ContractPayed(
            _id,
            apartments[_id].name,
            apartments[_id].totalSum,
            apartments[_id].paidSum,
            apartments[_id].seller,
            apartments[_id].status
        );
    }

    function getPaidSum(uint256 _id) public view returns (uint256) {
        return apartments[_id].paidSum;
    }

    function getDifference(uint256 _id) public view returns (uint256) {
        return apartments[_id].totalSum - apartments[_id].paidSum;
    }

    function isActive(uint256 _id) public view returns (bool) {
        return apartments[_id].status == Status.Active;
    }

    function getStatus(uint256 _id) public view returns (Status) {
        return apartments[_id].status;
    }

    function setCancelled(uint256 _id) public {
        require(apartments[_id].status == Status.Active);
        apartments[_id].status = Status.Cancelled;
        //return 90% of the sum to the buyer

        emit ContractCancelled(
            _id,
            apartments[_id].name,
            apartments[_id].status
        );
    }

    function setFinished(uint256 _id) private {
        apartments[_id].status = Status.Finished;

        emit ContractFinished(
            _id,
            apartments[_id].name,
            apartments[_id].status
        );
    }
}
