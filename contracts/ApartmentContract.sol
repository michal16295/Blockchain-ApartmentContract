pragma solidity ^0.5.1;

contract ApartmentContract {
    
    uint public totalSum;
    uint public paidSum = 0;
    uint oneEther = 1000000000000000000;
    address payable seller;
    address payable buyer;
    enum Status { Cancelled, Finished, Active }
    Status public status;
    

    constructor(uint _totalSum, address payable _seller) public{
        totalSum = _totalSum * oneEther;
        status = Status.Active;
        seller = _seller;
    }
    
    function addPayment() public payable{
        require(status == Status.Active);
        paidSum += msg.value;
        seller.transfer(msg.value);
        if(paidSum >= totalSum) setFinished();
    }
    function getPaidSum() public view returns(uint){
        return paidSum;
    }
    function getDifference() public view returns(uint){
        return totalSum - paidSum;
    }
    
    function isActive() public view returns(bool) {
        return status == Status.Active;
    }
    function getStatus() public view returns(Status) {
        return status;
    }
   function setCancelled() public{
       require(status == Status.Active);
       status = Status.Cancelled;
       //return 90% of the sum to the buyer
   }
   function setFinished() private{
       status = Status.Finished;
   }

    
}