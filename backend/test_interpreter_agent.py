"""
Test script for the Interpreter Agent
Run this to verify the agent is working correctly
"""

import asyncio
import os
from dotenv import load_dotenv
from agents.interpreter import InterpreterAgent

# Mock Supabase client for testing
class MockSupabase:
    def rpc(self, function_name, params):
        class MockResponse:
            data = [
                {
                    'content': 'Section 126(2) of BNS deals with wrongful restraint...',
                    'metadata': {'section': 'BNS 126(2)'}
                },
                {
                    'content': 'Section 316 of BNS deals with criminal breach of trust...',
                    'metadata': {'section': 'BNS 316'}
                }
            ]
            def execute(self):
                return self
        return MockResponse()

async def test_chat():
    """Test the chat functionality"""
    print("=" * 60)
    print("Testing Interpreter Agent - Chat Mode")
    print("=" * 60)
    
    # Load environment
    load_dotenv()
    
    if not os.getenv("GEMINI_API_KEY"):
        print("❌ Error: GEMINI_API_KEY not found in environment")
        return
    
    # Initialize agent with mock Supabase
    agent = InterpreterAgent(MockSupabase())
    
    # Test conversation
    test_messages = [
        "My landlord locked my shop without notice and kept my ₹50,000 deposit",
        "Yes, I have been renting the shop for 2 years",
        "He said I was behind on rent but I have all payment receipts"
    ]
    
    user_id = "test_user_123"
    
    print("\n🤖 Starting conversation...\n")
    
    for i, message in enumerate(test_messages, 1):
        print(f"👤 User (Message {i}): {message}")
        print("⏳ Agent thinking...\n")
        
        try:
            result = await agent.chat(
                user_id=user_id,
                message=message,
                language="en"
            )
            
            print(f"🤖 Agent Response:")
            print(f"   {result['message'][:200]}...")
            print(f"\n   📚 Relevant Laws: {', '.join(result.get('relevant_laws', []))}")
            print(f"   ❓ Needs Clarification: {result.get('needs_clarification', False)}")
            print(f"   ✅ Ready to Draft: {result.get('ready_to_draft', False)}")
            print("\n" + "-" * 60 + "\n")
            
        except Exception as e:
            print(f"❌ Error: {e}\n")
            break
    
    # Test conversation summary
    print("📝 Getting conversation summary...\n")
    try:
        summary = await agent.summarize_conversation(user_id)
        print(f"Summary: {summary.get('summary', 'N/A')[:200]}...")
        print(f"Key Points: {summary.get('key_points', [])}")
        print(f"Legal Sections: {summary.get('legal_sections', [])}")
    except Exception as e:
        print(f"❌ Error getting summary: {e}")
    
    print("\n" + "=" * 60)
    print("✅ Test completed!")
    print("=" * 60)

async def test_interpret():
    """Test the legacy interpret_incident method"""
    print("\n" + "=" * 60)
    print("Testing Interpreter Agent - Legacy Mode")
    print("=" * 60)
    
    load_dotenv()
    
    if not os.getenv("GEMINI_API_KEY"):
        print("❌ Error: GEMINI_API_KEY not found in environment")
        return
    
    agent = InterpreterAgent(MockSupabase())
    
    incident = "My employer has not paid my salary for 3 months and is threatening to fire me if I complain"
    
    print(f"\n👤 User Incident: {incident}")
    print("⏳ Agent analyzing...\n")
    
    try:
        result = await agent.interpret_incident(incident, language="en")
        
        print(f"🤖 Agent Explanation:")
        print(f"   {result['explanation'][:300]}...")
        print(f"\n   📚 Relevant Laws: {', '.join(result.get('relevant_laws', []))}")
        
        print("\n" + "=" * 60)
        print("✅ Test completed!")
        print("=" * 60)
        
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    print("\n🚀 Nyaya-Setu Interpreter Agent Test Suite\n")
    
    # Run tests
    asyncio.run(test_chat())
    asyncio.run(test_interpret())
    
    print("\n✨ All tests completed!\n")
