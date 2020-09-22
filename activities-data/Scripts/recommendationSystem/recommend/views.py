from django.shortcuts import render
from django.http import HttpResponse
import json
import 

def index(request):
  x = [i for i in range(1, 69)]
  print(request.GET.get('user_id', ''))
  return HttpResponse("Hello, world. You're at the polls index." + request.GET.get('user_id', ''))
