import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Get credentials
username = os.getenv('NASA_EARTHDATA_USERNAME', '').strip()
password = os.getenv('NASA_EARTHDATA_PASSWORD', '').strip()

print("=== NASA Earthdata Credential Check ===")
print(f"Username: {username}")
print(f"Password: {'*' * len(password) if password else 'Not set'}")
print(f"Password length: {len(password)}")

# If you want to see the actual password (for debugging only), uncomment next line:
# print(f"Password: {password}")

print("\nIf the password looks correct, try logging in at:")
print("https://urs.earthdata.nasa.gov/")
print("\nIf login fails, please reset your password there.")
