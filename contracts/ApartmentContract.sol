pragma solidity ^0.5.1;

// Contract for buying and selling apratments or houses
contract ApartmentContract {
    // Counts number of contracts, also used for contract ID
    uint256 public count = 0;

    // Contract has 3 states
    // Active - means still paying
    // Finished - means paid total sum
    // Cancelled - means buyer cancelled the contract
    enum Status {Cancelled, Finished, Active}

    // Apartment contract
    struct Apartment {
        uint256 id;
        string name;
        uint256 totalSum;
        uint256 paidSum;
        address payable seller;
        address payable buyer;
        Status status;
    }

    // Map of contracts
    // Key - Contract ID
    // Value - Contract information
    mapping(uint256 => Apartment) public apartments;

    // Event is called when a new contract created
    event ContractCreated(
        uint256 id,
        string name,
        uint256 totalSum,
        uint256 paidSum,
        address seller,
        address buyer,
        Status status
    );

    // Event is called when a payment is transfered
    event ContractPayed(
        uint256 id,
        string name,
        uint256 totalSum,
        uint256 paidSum,
        address seller,
        Status status
    );

    // Event is called when contract is finished (fully paid)
    event ContractFinished(uint256 id, string name, Status status);

    // Event is called when buyer cancels the contract
    event ContractCancelled(uint256 id, string name, Status status);

    // Constructor when the contract is first created
    // The contract "Test contract" is for tests
    constructor() public {
        createContract(
            "Test contract",
            5,
            0x090ec50a3f1184251E1041E5310F0f324FBD908E
        );
    }

    // Function to create a new contract
    // _name - address of apartment or house
    // _totalSum - total sum in ether
    // _seller - address of seller
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
            msg.sender,
            Status.Active
        );
        emit ContractCreated(
            count,
            _name,
            _totalSum,
            0,
            _seller,
            msg.sender,
            Status.Active
        );
    }

    // Function for paying to seller
    // _id - contract ID
    // The function is payable and the amount is transfered to seller and logged in paidSum
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

    // Function to get the paid amount
    // _id - contract ID
    function getPaidSum(uint256 _id) public view returns (uint256) {
        return apartments[_id].paidSum;
    }

    // Function to get how much left to pay for the apartment or house
    // _id - contract ID
    function getDifference(uint256 _id) public view returns (uint256) {
        return apartments[_id].totalSum - apartments[_id].paidSum;
    }

    // Function to check if contract is active
    // _id - contract ID
    function isActive(uint256 _id) public view returns (bool) {
        return apartments[_id].status == Status.Active;
    }

    // Function to get contract status
    // _id - contract ID
    function getStatus(uint256 _id) public view returns (Status) {
        return apartments[_id].status;
    }

    // Function to cancel the contract and make it un-payable, only buyer can cancel it and only when it is active
    // _id - contract ID
    function setCancelled(uint256 _id) public {
        require(apartments[_id].status == Status.Active);
        require(apartments[_id].buyer == msg.sender);
        apartments[_id].status = Status.Cancelled;

        emit ContractCancelled(
            _id,
            apartments[_id].name,
            apartments[_id].status
        );
    }

    // Function finish the contract and make it un-payable
    // It is private and can be called only from the function addPayment
    // _id - contract ID
    function setFinished(uint256 _id) private {
        apartments[_id].status = Status.Finished;

        emit ContractFinished(
            _id,
            apartments[_id].name,
            apartments[_id].status
        );
    }
}
