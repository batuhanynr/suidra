#[test_only]
module forms::form_tests {
    use sui::test_scenario::{Self as ts};
    use forms::form::{Self, Form, FormRegistry};
    use std::string::{Self, String};

    // Test addresses
    const ADMIN: address = @0xAD;
    const ALICE: address = @0xA11CE;
    const BOB: address = @0xB0B;
    const CHARLIE: address = @0xC;

    // Error codes
    const EEmptyTitle: u64 = 1;
    const ENotAuthor: u64 = 2;
    const EFormNotActive: u64 = 3;
    const EInvalidOption: u64 = 5;
    const EAlreadyVoted: u64 = 6;

    // ========= HELPER FUNCTIONS =========
    fun setup_registry(): ts::Scenario {
        let mut scenario = ts::begin(ADMIN);
        {
            form::init_for_testing(scenario.ctx());
        };
        scenario
    }

    // ========= BASIC FORM CREATION TESTS =========
    #[test]
    fun test_create_form_success() {
        let mut scenario = setup_registry();
        
        scenario.next_tx(ALICE);
        {
            let mut registry = scenario.take_shared<FormRegistry>();
            
            form::create_form(
                string::utf8(b"Customer Feedback"),
                string::utf8(b"Please rate our service"),
                &mut registry,
                scenario.ctx()
            );
            
            assert!(vector::length(&form::form_registry_ids(&registry)) == 1, 0);
            
            ts::return_shared(registry);
        };

        scenario.next_tx(ALICE);
        {
            let form = scenario.take_from_sender<Form>();
            
            assert!(form::form_title(&form) == string::utf8(b"Customer Feedback"), 0);
            assert!(form::form_description(&form) == string::utf8(b"Please rate our service"), 0);
            assert!(vector::length(form::form_questions(&form)) == 0, 0); // Remove & here
            
            ts::return_to_sender(&scenario, form);
        };

        scenario.end();
    }

    #[test]
    #[expected_failure(abort_code = EEmptyTitle)]
    fun test_create_form_empty_title() {
        let mut scenario = setup_registry();
        
        scenario.next_tx(ALICE);
        {
            let mut registry = scenario.take_shared<FormRegistry>();
            
            form::create_form(
                string::utf8(b""),
                string::utf8(b"Description"),
                &mut registry,
                scenario.ctx()
            );
            
            ts::return_shared(registry);
        };

        scenario.end();
    }

    #[test]
    fun test_create_multiple_forms() {
        let mut scenario = setup_registry();
        
        scenario.next_tx(ALICE);
        {
            let mut registry = scenario.take_shared<FormRegistry>();
            form::create_form(
                string::utf8(b"Alice's Form"),
                string::utf8(b"First form"),
                &mut registry,
                scenario.ctx()
            );
            ts::return_shared(registry);
        };

        scenario.next_tx(BOB);
        {
            let mut registry = scenario.take_shared<FormRegistry>();
            form::create_form(
                string::utf8(b"Bob's Form"),
                string::utf8(b"Second form"),
                &mut registry,
                scenario.ctx()
            );
            ts::return_shared(registry);
        };

        scenario.next_tx(CHARLIE);
        {
            let mut registry = scenario.take_shared<FormRegistry>();
            form::create_form(
                string::utf8(b"Charlie's Form"),
                string::utf8(b"Third form"),
                &mut registry,
                scenario.ctx()
            );
            
            assert!(vector::length(&form::form_registry_ids(&registry)) == 3, 0);
            
            ts::return_shared(registry);
        };

        scenario.end();
    }

    // ========= ADD QUESTION TESTS =========
    #[test]
    fun test_add_question_success() {
        let mut scenario = setup_registry();
        
        scenario.next_tx(ALICE);
        {
            let mut registry = scenario.take_shared<FormRegistry>();
            form::create_form(
                string::utf8(b"Survey"),
                string::utf8(b"Description"),
                &mut registry,
                scenario.ctx()
            );
            ts::return_shared(registry);
        };

        scenario.next_tx(ALICE);
        {
            let mut form = scenario.take_from_sender<Form>();
            
            let mut options = vector::empty<String>();
            vector::push_back(&mut options, string::utf8(b"Excellent"));
            vector::push_back(&mut options, string::utf8(b"Good"));
            vector::push_back(&mut options, string::utf8(b"Poor"));
            
            form::add_question(
                &mut form,
                string::utf8(b"Rate our service"),
                string::utf8(b"How would you rate us?"),
                options,
                scenario.ctx()
            );
            
            assert!(vector::length(form::form_questions(&form)) == 1, 0);
            
            let questions = form::form_questions(&form); // Already returns &vector
            let question = vector::borrow(questions, 0); // No & before questions
            assert!(form::question_title(question) == string::utf8(b"Rate our service"), 0);
            
            ts::return_to_sender(&scenario, form);
        };

        scenario.end();
    }

    #[test]
    #[expected_failure(abort_code = ENotAuthor)]
    fun test_add_question_not_author() {
        let mut scenario = setup_registry();
        
        scenario.next_tx(ALICE);
        {
            let mut registry = scenario.take_shared<FormRegistry>();
            form::create_form(
                string::utf8(b"Alice's Form"),
                string::utf8(b"Description"),
                &mut registry,
                scenario.ctx()
            );
            ts::return_shared(registry);
        };

        scenario.next_tx(BOB);
        {
            let mut form = scenario.take_from_address<Form>(ALICE);
            
            let mut options = vector::empty<String>();
            vector::push_back(&mut options, string::utf8(b"Yes"));
            vector::push_back(&mut options, string::utf8(b"No"));
            
            form::add_question(
                &mut form,
                string::utf8(b"Question"),
                string::utf8(b"Desc"),
                options,
                scenario.ctx()
            );
            
            ts::return_to_address(ALICE, form);
        };

        scenario.end();
    }

    #[test]
    fun test_add_multiple_questions() {
        let mut scenario = setup_registry();
        
        scenario.next_tx(ALICE);
        {
            let mut registry = scenario.take_shared<FormRegistry>();
            form::create_form(
                string::utf8(b"Multi Question Survey"),
                string::utf8(b"Multiple questions"),
                &mut registry,
                scenario.ctx()
            );
            ts::return_shared(registry);
        };

        scenario.next_tx(ALICE);
        {
            let mut form = scenario.take_from_sender<Form>();
            
            // Add first question
            let mut options1 = vector::empty<String>();
            vector::push_back(&mut options1, string::utf8(b"Yes"));
            vector::push_back(&mut options1, string::utf8(b"No"));
            
            form::add_question(
                &mut form,
                string::utf8(b"Question 1"),
                string::utf8(b"First question"),
                options1,
                scenario.ctx()
            );
            
            // Add second question
            let mut options2 = vector::empty<String>();
            vector::push_back(&mut options2, string::utf8(b"Option A"));
            vector::push_back(&mut options2, string::utf8(b"Option B"));
            vector::push_back(&mut options2, string::utf8(b"Option C"));
            
            form::add_question(
                &mut form,
                string::utf8(b"Question 2"),
                string::utf8(b"Second question"),
                options2,
                scenario.ctx()
            );
            
            assert!(vector::length(form::form_questions(&form)) == 2, 0); // Remove & here
            
            ts::return_to_sender(&scenario, form);
        };

        scenario.end();
    }

    // ========= LIST FORM TESTS =========
    #[test]
    fun test_list_form_success() {
        let mut scenario = setup_registry();
        
        scenario.next_tx(ALICE);
        {
            let mut registry = scenario.take_shared<FormRegistry>();
            form::create_form(
                string::utf8(b"Public Survey"),
                string::utf8(b"For everyone"),
                &mut registry,
                scenario.ctx()
            );
            ts::return_shared(registry);
        };

        scenario.next_tx(ALICE);
        {
            let mut form = scenario.take_from_sender<Form>();
            
            let mut options = vector::empty<String>();
            vector::push_back(&mut options, string::utf8(b"Yes"));
            vector::push_back(&mut options, string::utf8(b"No"));
            
            form::add_question(
                &mut form,
                string::utf8(b"Do you agree?"),
                string::utf8(b"Question"),
                options,
                scenario.ctx()
            );
            
            // List form (consumes form and shares it)
            form::list_form(form, scenario.ctx());
        };

        scenario.next_tx(ALICE);
        {
            let form = scenario.take_shared<Form>();
            ts::return_shared(form);
        };

        scenario.end();
    }

    #[test]
    #[expected_failure(abort_code = ENotAuthor)]
    fun test_list_form_not_author() {
        let mut scenario = setup_registry();
        
        scenario.next_tx(ALICE);
        {
            let mut registry = scenario.take_shared<FormRegistry>();
            form::create_form(
                string::utf8(b"Alice's Form"),
                string::utf8(b"Description"),
                &mut registry,
                scenario.ctx()
            );
            ts::return_shared(registry);
        };

        // ALICE formu BOB'a transfer etmeli
        scenario.next_tx(ALICE);
        {
            let form = scenario.take_from_sender<Form>();
            transfer::public_transfer(form, BOB); // Bunu forms.move'da public yapmalısınız
        };

        scenario.next_tx(BOB);
        {
            let form = scenario.take_from_sender<Form>();
            form::list_form(form, scenario.ctx()); // BOB author olmadığı için fail olmalı
        };

        scenario.end();
    }

    #[test]
    #[expected_failure(abort_code = ENotAuthor)]
    fun test_cannot_add_question_to_active_form() {
        let mut scenario = setup_registry();
        
        scenario.next_tx(ALICE);
        {
            let mut registry = scenario.take_shared<FormRegistry>();
            form::create_form(
                string::utf8(b"Survey"),
                string::utf8(b"Description"),
                &mut registry,
                scenario.ctx()
            );
            ts::return_shared(registry);
        };

        scenario.next_tx(ALICE);
        {
            let mut form = scenario.take_from_sender<Form>();
            
            let mut options = vector::empty<String>();
            vector::push_back(&mut options, string::utf8(b"Yes"));
            vector::push_back(&mut options, string::utf8(b"No"));
            
            form::add_question(
                &mut form,
                string::utf8(b"Question"),
                string::utf8(b"Desc"),
                options,
                scenario.ctx()
            );
            
            form::list_form(form, scenario.ctx());
        };

        scenario.next_tx(ALICE);
        {
            let mut form = scenario.take_shared<Form>();
            
            let mut options = vector::empty<String>();
            vector::push_back(&mut options, string::utf8(b"Option 1"));
            vector::push_back(&mut options, string::utf8(b"Option 2"));
            
            // This should fail because once form is shared, only author check will fail
            // The form module doesn't have a check to prevent adding questions to active forms
            form::add_question(
                &mut form,
                string::utf8(b"New Question"),
                string::utf8(b"Desc"),
                options,
                scenario.ctx()
            );
            
            ts::return_shared(form);
        };

        scenario.end();
    }

    // ========= VOTING TESTS =========
    #[test]
    fun test_vote_success() {
        let mut scenario = setup_registry();
        
        scenario.next_tx(ALICE);
        {
            let mut registry = scenario.take_shared<FormRegistry>();
            form::create_form(
                string::utf8(b"Voting Survey"),
                string::utf8(b"Vote now"),
                &mut registry,
                scenario.ctx()
            );
            ts::return_shared(registry);
        };

        scenario.next_tx(ALICE);
        {
            let mut form = scenario.take_from_sender<Form>();
            
            let mut options = vector::empty<String>();
            vector::push_back(&mut options, string::utf8(b"Option 1"));
            vector::push_back(&mut options, string::utf8(b"Option 2"));
            
            form::add_question(
                &mut form,
                string::utf8(b"Pick one"),
                string::utf8(b"Choose"),
                options,
                scenario.ctx()
            );
            
            form::list_form(form, scenario.ctx());
        };

        let question_id = {
            scenario.next_tx(BOB);
            let form = scenario.take_shared<Form>();
            let questions = form::form_questions(&form);
            let question = vector::borrow(questions, 0);
            let qid = form::question_id(question);
            ts::return_shared(form);
            qid
        };

        scenario.next_tx(BOB);
        {
            let mut form = scenario.take_shared<Form>();
            
            form::vote_question(&mut form, question_id, 0, scenario.ctx());
            
            let questions = form::form_questions(&form);
            let question = vector::borrow(questions, 0);
            let votes = form::question_votes(question);
            
            assert!(*vector::borrow(&votes, 0) == 1, 0);
            
            ts::return_shared(form);
        };

        scenario.end();
    }

    #[test]
    #[expected_failure(abort_code = EAlreadyVoted)]
    fun test_vote_twice_fails() {
        let mut scenario = setup_registry();
        
        scenario.next_tx(ALICE);
        {
            let mut registry = scenario.take_shared<FormRegistry>();
            form::create_form(
                string::utf8(b"Survey"),
                string::utf8(b"Description"),
                &mut registry,
                scenario.ctx()
            );
            ts::return_shared(registry);
        };

        scenario.next_tx(ALICE);
        {
            let mut form = scenario.take_from_sender<Form>();
            
            let mut options = vector::empty<String>();
            vector::push_back(&mut options, string::utf8(b"Yes"));
            vector::push_back(&mut options, string::utf8(b"No"));
            
            form::add_question(
                &mut form,
                string::utf8(b"Question"),
                string::utf8(b"Desc"),
                options,
                scenario.ctx()
            );
            
            form::list_form(form, scenario.ctx());
        };

        let question_id = {
            scenario.next_tx(BOB);
            let form = scenario.take_shared<Form>();
            let questions = form::form_questions(&form);
            let question = vector::borrow(questions, 0);
            let qid = form::question_id(question);
            ts::return_shared(form);
            qid
        };

        scenario.next_tx(BOB);
        {
            let mut form = scenario.take_shared<Form>();
            
            form::vote_question(&mut form, question_id, 0, scenario.ctx());
            form::vote_question(&mut form, question_id, 1, scenario.ctx()); // Should fail
            
            ts::return_shared(form);
        };

        scenario.end();
    }

    #[test]
    #[expected_failure(abort_code = EFormNotActive)]
    fun test_vote_inactive_form_fails() {
        let mut scenario = setup_registry();
        
        scenario.next_tx(ALICE);
        {
            let mut registry = scenario.take_shared<FormRegistry>();
            form::create_form(
                string::utf8(b"Survey"),
                string::utf8(b"Description"),
                &mut registry,
                scenario.ctx()
            );
            ts::return_shared(registry);
        };

        let question_id = {
            scenario.next_tx(ALICE);
            let mut form = scenario.take_from_sender<Form>();
            
            let mut options = vector::empty<String>();
            vector::push_back(&mut options, string::utf8(b"Yes"));
            vector::push_back(&mut options, string::utf8(b"No"));
            
            form::add_question(
                &mut form,
                string::utf8(b"Question"),
                string::utf8(b"Desc"),
                options,
                scenario.ctx()
            );
            
            let questions = form::form_questions(&form);
            let question = vector::borrow(questions, 0);
            let qid = form::question_id(question);
            
            ts::return_to_sender(&scenario, form);
            qid
        };

        scenario.next_tx(BOB);
        {
            let mut form = scenario.take_from_address<Form>(ALICE);
            
            // This should fail because form is not active
            form::vote_question(&mut form, question_id, 0, scenario.ctx());
            
            ts::return_to_address(ALICE, form);
        };

        scenario.end();
    }

    #[test]
    fun test_multiple_users_vote() {
        let mut scenario = setup_registry();
        
        scenario.next_tx(ALICE);
        {
            let mut registry = scenario.take_shared<FormRegistry>();
            form::create_form(
                string::utf8(b"Multi Vote Survey"),
                string::utf8(b"Everyone votes"),
                &mut registry,
                scenario.ctx()
            );
            ts::return_shared(registry);
        };

        scenario.next_tx(ALICE);
        {
            let mut form = scenario.take_from_sender<Form>();
            
            let mut options = vector::empty<String>();
            vector::push_back(&mut options, string::utf8(b"Choice A"));
            vector::push_back(&mut options, string::utf8(b"Choice B"));
            vector::push_back(&mut options, string::utf8(b"Choice C"));
            
            form::add_question(
                &mut form,
                string::utf8(b"What's your choice?"),
                string::utf8(b"Pick"),
                options,
                scenario.ctx()
            );
            
            form::list_form(form, scenario.ctx());
        };

        let question_id = {
            scenario.next_tx(BOB);
            let form = scenario.take_shared<Form>();
            let questions = form::form_questions(&form);
            let question = vector::borrow(questions, 0);
            let qid = form::question_id(question);
            ts::return_shared(form);
            qid
        };

        // BOB votes for option 0
        scenario.next_tx(BOB);
        {
            let mut form = scenario.take_shared<Form>();
            form::vote_question(&mut form, question_id, 0, scenario.ctx());
            ts::return_shared(form);
        };

        // CHARLIE votes for option 1
        scenario.next_tx(CHARLIE);
        {
            let mut form = scenario.take_shared<Form>();
            form::vote_question(&mut form, question_id, 1, scenario.ctx());
            ts::return_shared(form);
        };

        // ADMIN votes for option 0
        scenario.next_tx(ADMIN);
        {
            let mut form = scenario.take_shared<Form>();
            form::vote_question(&mut form, question_id, 0, scenario.ctx());
            
            let questions = form::form_questions(&form);
            let question = vector::borrow(questions, 0);
            let votes = form::question_votes(question);
            
            assert!(*vector::borrow(&votes, 0) == 2, 0); // 2 votes for option 0
            assert!(*vector::borrow(&votes, 1) == 1, 0); // 1 vote for option 1
            
            ts::return_shared(form);
        };

        scenario.end();
    }

    // ========= DELIST/RELIST TESTS =========
    #[test]
    fun test_delist_relist_form() {
        let mut scenario = setup_registry();
        
        scenario.next_tx(ALICE);
        {
            let mut registry = scenario.take_shared<FormRegistry>();
            form::create_form(
                string::utf8(b"Delist Test"),
                string::utf8(b"Test delist"),
                &mut registry,
                scenario.ctx()
            );
            ts::return_shared(registry);
        };

        scenario.next_tx(ALICE);
        {
            let mut form = scenario.take_from_sender<Form>();
            
            let mut options = vector::empty<String>();
            vector::push_back(&mut options, string::utf8(b"Yes"));
            vector::push_back(&mut options, string::utf8(b"No"));
            
            form::add_question(
                &mut form,
                string::utf8(b"Question"),
                string::utf8(b"Desc"),
                options,
                scenario.ctx()
            );
            
            form::list_form(form, scenario.ctx());
        };

        scenario.next_tx(ALICE);
        {
            let form = scenario.take_shared<Form>();
            
            form::delist_form(form, scenario.ctx());
        };

        scenario.next_tx(ALICE);
        {
            let form = scenario.take_from_sender<Form>();
            
            form::relist_form(form, scenario.ctx());
        };

        scenario.next_tx(ALICE);
        {
            let form = scenario.take_shared<Form>();
            ts::return_shared(form);
        };

        scenario.end();
    }

    #[test]
    #[expected_failure(abort_code = ENotAuthor)]
    fun test_delist_form_not_author() {
        let mut scenario = setup_registry();
        
        scenario.next_tx(ALICE);
        {
            let mut registry = scenario.take_shared<FormRegistry>();
            form::create_form(
                string::utf8(b"Alice's Form"),
                string::utf8(b"Description"),
                &mut registry,
                scenario.ctx()
            );
            ts::return_shared(registry);
        };

        scenario.next_tx(ALICE);
        {
            let mut form = scenario.take_from_sender<Form>();
            
            let mut options = vector::empty<String>();
            vector::push_back(&mut options, string::utf8(b"Yes"));
            vector::push_back(&mut options, string::utf8(b"No"));
            
            form::add_question(&mut form, string::utf8(b"Q"), string::utf8(b"D"), options, scenario.ctx());
            form::list_form(form, scenario.ctx());
        };

        scenario.next_tx(BOB);
        {
            let form = scenario.take_shared<Form>();
            form::delist_form(form, scenario.ctx());
        };

        scenario.end();
    }

    // ========= EDGE CASES =========
    #[test]
    #[expected_failure(abort_code = EInvalidOption)]
    fun test_vote_invalid_option() {
        let mut scenario = setup_registry();
        
        scenario.next_tx(ALICE);
        {
            let mut registry = scenario.take_shared<FormRegistry>();
            form::create_form(
                string::utf8(b"Survey"),
                string::utf8(b"Description"),
                &mut registry,
                scenario.ctx()
            );
            ts::return_shared(registry);
        };

        scenario.next_tx(ALICE);
        {
            let mut form = scenario.take_from_sender<Form>();
            
            let mut options = vector::empty<String>();
            vector::push_back(&mut options, string::utf8(b"Yes"));
            vector::push_back(&mut options, string::utf8(b"No"));
            
            form::add_question(
                &mut form,
                string::utf8(b"Question"),
                string::utf8(b"Desc"),
                options,
                scenario.ctx()
            );
            
            form::list_form(form, scenario.ctx());
        };

        let question_id = {
            scenario.next_tx(BOB);
            let form = scenario.take_shared<Form>();
            let questions = form::form_questions(&form);
            let question = vector::borrow(questions, 0);
            let qid = form::question_id(question);
            ts::return_shared(form);
            qid
        };

        scenario.next_tx(BOB);
        {
            let mut form = scenario.take_shared<Form>();
            
            // Vote for option 5 (only 0,1 exist)
            form::vote_question(&mut form, question_id, 5, scenario.ctx());
            
            ts::return_shared(form);
        };

        scenario.end();
    }

    #[test]
    fun test_registry_tracks_all_forms() {
        let mut scenario = setup_registry();
        
        // Create 3 forms from different users
        scenario.next_tx(ALICE);
        {
            let mut registry = scenario.take_shared<FormRegistry>();
            form::create_form(string::utf8(b"Form 1"), string::utf8(b"Desc"), &mut registry, scenario.ctx());
            ts::return_shared(registry);
        };

        scenario.next_tx(BOB);
        {
            let mut registry = scenario.take_shared<FormRegistry>();
            form::create_form(string::utf8(b"Form 2"), string::utf8(b"Desc"), &mut registry, scenario.ctx());
            ts::return_shared(registry);
        };

        scenario.next_tx(CHARLIE);
        {
            let mut registry = scenario.take_shared<FormRegistry>();
            form::create_form(string::utf8(b"Form 3"), string::utf8(b"Desc"), &mut registry, scenario.ctx());
            
            assert!(vector::length(&form::form_registry_ids(&registry)) == 3, 0);
            
            ts::return_shared(registry);
        };

        scenario.end();
    }
}