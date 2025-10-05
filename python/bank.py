# Get greetings input from user
greeting = input('Greeting: ').strip()

if len(greeting) > 4 and greeting[:5] == 'Hello':
    print('$0')
elif greeting[0] == 'H':
    print('$20')
else:
    print('$100')
