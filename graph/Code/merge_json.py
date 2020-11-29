import json

with open('popularitygraph.json') as json_file:
    json_pop = json.load(json_file)


with open('winrategraph.json') as json_file:
    json_win = json.load(json_file)

#print(json_pop)
#print(json_win)


print(json_pop['nodes']==json_win['nodes'])
print(json_pop['links']==json_win['links'])

print (range(len(json_win['links'])))

pop_links = json_pop['links']
win_links = json_win['links']

for i in range(len(pop_links)):
    pop_link = pop_links[i]
    win_link = win_links[i]
    assert(pop_link['source']==win_link['source'])
    assert(pop_link['target'] == win_link['target'])
    pop_link['winweight'] = win_link['weight']

with open('merged.json', 'w') as outfile:
    json.dump(json_pop, outfile,indent=4)



#json_decoded['ADDED_KEY'] = 'ADDED_VALUE'
#
#with open(json_file, 'w') as json_file:
#    json.dump(json_decoded, json_file)
