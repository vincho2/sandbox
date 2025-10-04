# Initialize coin list in cents and change amount
coins = [25, 10, 5, 1]
change = 0

# Ask the user how much change is owed until he/she provides a positive float
while True:
    change = float(input("Change: ")) * 100
    if change > 0:
        break

# Initialise coin count
coin_count = 0

# Compute the number of coins to be given back
for coin in coins:
    if change == 0:
        break
    elif change >= coin:
        coin_count = change // coin
        change = change % coin

# Diplay result
print(int(coin_count))
