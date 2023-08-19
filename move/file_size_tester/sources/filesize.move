module file_size_tester::filesize {

    use std::vector;
    use std::string::{String};

    use sui::tx_context::{Self, TxContext};
    use sui::dynamic_field as df;
    use sui::object::{Self, UID};

    use sui::transfer;
    use sui::package;


    struct Picture has key, store {
        id: UID,
        description:String,
        bytes: vector<u8>
    }


    struct FILESIZE has drop {}

    /// Module Initializer
    fun init(otw: FILESIZE, ctx: &mut TxContext) {

        let publisher = package::claim(otw, ctx);
        transfer::public_transfer(publisher, tx_context::sender(ctx));

    }


    /// Business Functions


    /// Mint a new Picture

    public fun mint_picture(description:String, bytes:vector<u8>, ctx: &mut TxContext): Picture {
        let pic = Picture {
            id: object::new(ctx),
            description,
            bytes
        };
        pic
    }

    public fun mint_picture_empty(description:String, ctx: &mut TxContext): Picture {
        let pic = Picture {
            id: object::new(ctx),
            description,
            bytes : vector::empty()
        };
        pic
    }

    public fun add_bytes_in_picture(pic: &mut Picture, input_bytes:vector<u8>) {
        vector::append(&mut pic.bytes, input_bytes);
    }

    public fun add_bytes_as_dof(pic: &mut Picture, num:u8, input_bytes:vector<u8>) {
        df::add(&mut pic.id, num, input_bytes);
    }

    public fun add_bytes_as_dof_2_inputs(pic: &mut Picture, num:u8, input_bytes1:vector<u8>,  input_bytes2:vector<u8>) {
        df::add(&mut pic.id, num, input_bytes1);
        df::add(&mut pic.id, num, input_bytes2);
    }

}