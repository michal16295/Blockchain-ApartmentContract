const ApartmentContract = artifacts.require("./ApartmentContract.sol");

contract("ApartmentContract", accounts => {
    before(async () => {
        this.contract = await ApartmentContract.deployed();
    });

    it("deploys successfully", async () => {
        const address = await this.contract.address;

        assert.notEqual(address, 0x0);
        assert.notEqual(address, '');
        assert.notEqual(address, null);
        assert.notEqual(address, undefined);
    });

    // uint256 id;
    // string name;
    // uint256 totalSum;
    // uint256 paidSum;
    // address payable seller;
    // Status status;

    it("lists contracts", async () => {
        const count = await this.contract.count();
        const c = await this.contract.apartments(count);

        assert.equal(c.id.toNumber(), count.toNumber());
        assert.equal(c.name, 'Test contract');
        assert.equal(c.totalSum.toNumber(), 5);
        assert.equal(c.paidSum.toNumber(), 0);
        assert.equal(c.seller, '0x090ec50a3f1184251E1041E5310F0f324FBD908E');
        assert.equal(c.status, 2);
        assert.equal(count.toNumber(), 1);
    });

    it("creates contracts", async () => {
        let name = 'A new contract';
        let totalSum = 5;
        let seller = '0x090ec50a3f1184251E1041E5310F0f324FBD908E';
        let buyer = '0x0022BaBB2FfAb88cDb4aF68EC6E2e2EaBDF396a4';

        const result = await this.contract.createContract(name, totalSum, seller, { from: buyer });
        const count = await this.contract.count();

        assert.equal(count, 2);
        const event = result.logs[0].args;
        assert.equal(event.id.toNumber(), 2);
        assert.equal(event.name, name);
        assert.equal(event.totalSum.toNumber(), totalSum);
        assert.equal(event.paidSum.toNumber(), 0);
        assert.equal(event.seller, seller);
        assert.equal(event.buyer, buyer);
        assert.equal(event.status, 2);
    });

    it("checks buyer field", async () => {
        let name = 'A new contract';
        let totalSum = 5;
        let seller = '0x090ec50a3f1184251E1041E5310F0f324FBD908E';
        let buyer = '0x0022BaBB2FfAb88cDb4aF68EC6E2e2EaBDF396a4';
        const newContract = await this.contract.createContract(name, totalSum, seller, { from: buyer });
        assert.notEqual(newContract.tx, undefined);

        const count = await this.contract.count();
        const c = await this.contract.apartments(count);

        assert.equal(c.id.toNumber(), count.toNumber());
        assert.equal(c.name, name);
        assert.equal(c.totalSum.toNumber(), totalSum);
        assert.equal(c.paidSum.toNumber(), 0);
        assert.equal(c.seller, seller);
        assert.equal(c.buyer, buyer);
        assert.equal(c.status, 2);
    });

    it("pays contracts", async () => {
        const id = 1;
        const name = 'Test contract';
        const totalSum = 5;
        const paidSum = 1;
        const seller = '0x090ec50a3f1184251E1041E5310F0f324FBD908E';

        const result = await this.contract.addPayment(id, { value: paidSum });

        const event = result.logs[0].args;
        assert.equal(event.id.toNumber(), id);
        assert.equal(event.name, name);
        assert.equal(event.totalSum.toNumber(), totalSum);
        assert.equal(event.paidSum.toNumber(), paidSum);
        assert.equal(event.seller, seller);
        assert.equal(event.status, 2);
    });

    it("finishes contracts", async () => {
        const id = 1;
        const name = 'Test contract';

        const result = await this.contract.addPayment(id, { value: 5 });

        const event = result.logs[0].args;
        assert.equal(event.id.toNumber(), id);
        assert.equal(event.name, name);
        assert.equal(event.status.toNumber(), 1);
    });

    it("cancels contracts", async () => {
        const id = Number(await this.contract.count()) + 1;
        const name = 'Test contract cancel';
        const totalSum = 3;
        let seller = '0x090ec50a3f1184251E1041E5310F0f324FBD908E';
        let buyer = '0x0022babb2ffab88cdb4af68ec6e2e2eabdf396a4';

        const c = await this.contract.createContract(name, totalSum, seller, { from: buyer });
        const c_event = c.logs[0].args;
        assert.equal(c_event.id.toNumber(), id);

        const result = await this.contract.setCancelled(id, { from: buyer });

        const event = result.logs[0].args;
        assert.equal(event.id.toNumber(), id);
        assert.equal(event.name, name);
        assert.equal(event.status.toNumber(), 0);
    });

});
