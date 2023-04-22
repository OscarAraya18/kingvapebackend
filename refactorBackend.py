def refactorDatabase(databaseLocation):
    database = {}
    with open(databaseLocation, 'r') as databaseJSON:
        database = eval(databaseJSON.read())
    databaseKeys = database.keys()
    for databaseKey in databaseKeys:
        database[databaseKey]['isAvailable'] = 'Si'
        database[databaseKey]['availableDate'] = '2023-01-01'
    with open(databaseLocation, 'w') as databaseJSON:
        databaseJSON.write(str(database))

#refactorDatabase('productDatabasePython.json')