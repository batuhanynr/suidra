module forms::form; 
// ========= IMPORTS =========
use std::string::{Self, String}; 
use sui::event;
use sui::object_table::{Self, ObjectTable};


// ========= ERRORS =========
const EEmptyTitle: u64 = 1;
const ENotAuthor: u64 = 2;
const EFormNotActive: u64 = 3;
const EFormAlreadyActive: u64 = 4;
const EInvalidOption: u64 = 5;
const EAlreadyVoted: u64 = 6;


// ========= STRUCTS =========
public struct Form has key {
    id: UID,
    title: String,
    description: String,
    author: address,
    questions: vector<Question>,
    is_active: bool  // Indicates if the form is active for voting
}

public struct Question has key, store {
    id: UID,
    title: String,
    description: String,
    options: vector<String>,
    votes: vector<u64>,
    addresses: vector<address>
}

public struct FormMetadata has key, store {
    id: UID,
    timestamp: u64
}

public struct FormRegistry has key {
    id: UID,
    forms: vector<ID>,
    counter: u64
}

// ========= EVENTS =========

public struct FormListed has copy, drop {
    id: ID,
    author: address,
    timestamp: u64
}

public struct FormDelisted has copy, drop {
    form_id: ID,
    author: address,
    timestamp: u64
}

public struct UserVoted has copy, drop {
    id: ID,
    author: address,
    user: address,
    timestamp: u64
}
public struct FormDeleted has copy, drop {
    form_id: ID,
    author: address,
    timestamp: u64,
}

// ========= FUNCTIONS =========

fun init(ctx: &mut TxContext) {
    transfer::share_object(FormRegistry {
        id: object::new(ctx),
        forms: vector::empty<ID>(),
        counter: 0,
    });
}

#[allow(lint(self_transfer))]
public fun create_form(title: String, description: String, registry: &mut FormRegistry, ctx: &mut TxContext): Form {
    assert!(string::length(&title) > 0, EEmptyTitle);
    let form = Form {
        id: object::new(ctx),
        title,
        description,
        author: ctx.sender(),
        questions: vector::empty<Question>(),
        is_active: false
    };

    let form_metadata = FormMetadata {
        id: object::new(ctx),
        timestamp: ctx.epoch_timestamp_ms()
    };

    vector::push_back(&mut registry.forms, object::id(&form));
    registry.counter = registry.counter + 1;
    
    transfer::freeze_object(form_metadata);

    form
}

public fun transfer_form_to_creator(form: Form, ctx: &mut TxContext) {
    assert!(ctx.sender() == form.author, ENotAuthor);
    transfer::transfer(form, ctx.sender());
}

public fun list_form(form: Form, ctx: &mut TxContext) {
    assert!(ctx.sender() == form.author, ENotAuthor);
    assert!(!form.is_active, EFormAlreadyActive);  // Zaten aktifse
    
    let mut form = form;
    form.is_active = true;

    event::emit(FormListed {
        id: object::id(&form),
        author: ctx.sender(),
        timestamp: ctx.epoch_timestamp_ms()
    });

    transfer::share_object(form);
}

public fun delist_form(form: Form, ctx: &mut TxContext) {
    assert!(ctx.sender() == form.author, ENotAuthor);
    assert!(form.is_active, EFormNotActive);

    let mut form = form;
    form.is_active = false;

    event::emit(FormDelisted {
        form_id: object::id(&form),
        author: ctx.sender(),
        timestamp: ctx.epoch_timestamp_ms()
    });

    transfer::transfer(form, ctx.sender());
}

public fun relist_form(form: Form, ctx: &mut TxContext) {
    assert!(ctx.sender() == form.author, ENotAuthor);
    assert!(!form.is_active, EFormAlreadyActive);

    let mut form = form;
    form.is_active = true;

    event::emit(FormListed {
        id: object::id(&form),
        author: ctx.sender(),
        timestamp: ctx.epoch_timestamp_ms()
    });

    transfer::share_object(form);
}

public fun add_question(form: &mut Form, title: String, description: String, options: vector<String>, ctx: &mut TxContext) {
    assert!(ctx.sender() == form.author, ENotAuthor);  // Sadece author
        assert!(!form.is_active, EFormAlreadyActive);

    // Initialize votes vector with zeros
    let mut votes = vector::empty<u64>();
    let mut i = 0;
    while (i < vector::length(&options)) {
        vector::push_back(&mut votes, 0);
        i = i + 1;
    };
    
    let question = Question {
        id: object::new(ctx),
        title,
        description,
        options,
        votes: vector::empty<u64>(),
        addresses: vector::empty<address>()
    };

    vector::push_back(&mut form.questions, question);
}


public fun vote_question(form: &mut Form, question_id: ID, option_index: u64, ctx: &mut TxContext) {
    assert!(form.is_active, EFormNotActive);

    let questions = &mut form.questions;
    
    let mut i = 0;
    while (i < vector::length(questions)) {
        let question = vector::borrow_mut(questions, i);
        if (object::id(question) == question_id) {
            let voter_address = ctx.sender();

            // Check if the user has already voted
            assert!(!vector::contains(&question.addresses, &voter_address), EAlreadyVoted);
            
            // Validate option index
            assert!(option_index < vector::length(&question.options), EInvalidOption);
            
            //initialize votes if empty
            while(vector::length(&question.votes) < vector::length(&question.options)) {
                vector::push_back(&mut question.votes, 0);
            };
            // Record the vote
            let current_votes = vector::borrow_mut(&mut question.votes, option_index);
            *current_votes = *current_votes + 1;

            // Add voter address
            vector::push_back(&mut question.addresses, voter_address);

            break
        };
        i = i + 1;
    };

    // Emit UserVoted event
    event::emit(UserVoted {
        id: question_id,
        author: form.author,
        user: ctx.sender(),
        timestamp: ctx.epoch_timestamp_ms()
    });
}
        

// ========= GETTER FUNCTIONS =========
    
#[test_only]
public fun form_title(form: &Form): String {
    form.title
}

#[test_only]
public fun form_description(form: &Form): String {
    form.description
}

#[test_only]
public fun form_questions(form: &Form): &vector<Question> {
    &form.questions
}

#[test_only]
public fun form_id(form: &Form): ID {
    object::id(form)
}

#[test_only]
public fun question_title(question: &Question): String {
    question.title
}

#[test_only]
public fun question_description(question: &Question): String {
    question.description
}

#[test_only]
public fun question_options(question: &Question): vector<String> {
    question.options
}

#[test_only]
public fun question_votes(question: &Question): vector<u64> {
    question.votes
}

#[test_only]
public fun question_addresses(question: &Question): vector<address> {
    question.addresses
}

#[test_only]
public fun question_id(question: &Question): ID {
    object::id(question)
}

public fun form_registry_ids(registry: &FormRegistry): vector<ID> {
    registry.forms
}

#[test_only]
public fun init_for_testing(ctx: &mut TxContext) {
    init(ctx);
}





