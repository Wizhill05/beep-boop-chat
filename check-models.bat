@echo off
echo Checking LLM Models in database:
mysql -u root -p -e "USE beep_boop_chat; SELECT name, token_cost, model_path FROM llm_models;"
