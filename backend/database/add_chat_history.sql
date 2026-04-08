-- Chat history table for conversation persistence
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'bot')),
    message TEXT NOT NULL,
    relevant_laws TEXT[],
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS chat_messages_case_id_idx ON chat_messages(case_id);
CREATE INDEX IF NOT EXISTS chat_messages_user_id_idx ON chat_messages(user_id);
CREATE INDEX IF NOT EXISTS chat_messages_created_at_idx ON chat_messages(created_at);

-- Function to get chat history for a case
CREATE OR REPLACE FUNCTION get_chat_history(
    p_case_id UUID,
    p_user_id UUID,
    message_limit INT DEFAULT 50
)
RETURNS TABLE (
    id UUID,
    role TEXT,
    message TEXT,
    relevant_laws TEXT[],
    metadata JSONB,
    created_at TIMESTAMP
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        chat_messages.id,
        chat_messages.role,
        chat_messages.message,
        chat_messages.relevant_laws,
        chat_messages.metadata,
        chat_messages.created_at
    FROM chat_messages
    WHERE chat_messages.case_id = p_case_id
      AND chat_messages.user_id = p_user_id
    ORDER BY chat_messages.created_at ASC
    LIMIT message_limit;
END;
$$;

-- Function to delete chat history for a case
CREATE OR REPLACE FUNCTION delete_chat_history(
    p_case_id UUID,
    p_user_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
BEGIN
    DELETE FROM chat_messages
    WHERE case_id = p_case_id
      AND user_id = p_user_id;
    
    RETURN TRUE;
END;
$$;

COMMENT ON TABLE chat_messages IS 'Stores chat conversation history between users and the AI interpreter agent';
COMMENT ON COLUMN chat_messages.role IS 'Either "user" or "bot" to indicate who sent the message';
COMMENT ON COLUMN chat_messages.relevant_laws IS 'Array of legal sections identified in this message';
COMMENT ON COLUMN chat_messages.metadata IS 'Additional metadata like needs_clarification, ready_to_draft flags';
