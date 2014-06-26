from __future__ import print_function
import fileinput
import operator
from collections import defaultdict
import sys
import os
counts = defaultdict(int)
iters = 0
refresh_time = 100
NUM_TO_PRINT = 10

def norm((k,v)):
	tokens = k.rstrip().split('\t')
	print(k.rstrip() + '\t' + str(v))

def err((k,v)):
	tokens = k.rstrip().split('\t')
	print (map(lambda x: x.ljust(30), tokens), v, file=sys.stderr)

#todo: move this conditional to skip-gram
def removeSameAction((k,v)):
	spl = k.split('\t')
	if spl[0] != spl[1].rstrip():
		return True
	return False

for line in fileinput.input():
	actions = line
	counts[actions] += 1
	val = counts[actions]
	counts.values()
	iters = iters +1
	if(iters%refresh_time == 0):
		os.system('clear')
		print ("Processed " + str(iters) + " items", file=sys.stderr)
		c = sorted(counts.iteritems(), key=operator.itemgetter(1), reverse= True)
		bound = NUM_TO_PRINT
		filtered =  c[:bound]
		while(True):
			filtered = filter(removeSameAction, filtered)
			if len(filtered) == NUM_TO_PRINT or len(c) < bound + 1:
				break
			filtered.append(c[bound])
			bound = bound+1
		map(err, filtered)
		print ("--------------", file=sys.stderr)

counts = sorted(counts.iteritems(), key=operator.itemgetter(1), reverse= True)
counts = filter(lambda (k,v): True if v >1 else False, counts)
map(norm, counts)