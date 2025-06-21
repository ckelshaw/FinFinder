import express from 'express';
import supabase from '../supabaseClient.js';

const router = express.Router();

router.post('/', async (req, res) => {
    const { clerk_user_id, username, first_name, last_name} = req.body;

    try {
        //Checking if user exists
        const { data: existingUser, error: selectError } = await supabase
            .from('users')
            .select('*')
            .eq('id', clerk_user_id)
            .single();

        if(selectError && selectError.code !== 'PGRST116') {
            //PGRST116 means no rows returned
            throw selectError;
        }

        if(existingUser) {
            return res.status(200).json({message: 'User already exists', user: existingUser});
        }

        //If the user didn't already exist add the new user
        const { data, error: insertError } = await supabase
            .from('users')
            .insert([
                {id: clerk_user_id, first_name: first_name, last_name: last_name, username: username}
            ])
            .select();

        if(insertError) throw insertError;

        res.status(201).json({message: 'User created', user: data[0]});
    } catch (error) {
        console.error('User insert error: ', error.message);
        res.status(500).json({ error: error.message });
    }
});

export default router;