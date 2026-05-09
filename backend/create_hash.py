import bcrypt

password = "123456"
hashed = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
print("New hash for '123456':")
print(hashed.decode('utf-8'))