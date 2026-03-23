import traceback
try:
    import train
    train.main()
except Exception as e:
    with open('traceback.txt', 'w') as f:
        traceback.print_exc(file=f)
