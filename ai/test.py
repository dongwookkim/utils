#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""The Python implementation of GiGA Genie gRPC client"""
from __future__ import print_function

import grpc
import gigagenieRPC_pb2
import gigagenieRPC_pb2_grpc
import os
import datetime
import hmac
import hashlib
# Config for GiGA Genie gRPC
CLIENT_ID = 'Y2xpZW50X2lkMTU4MTY0MTUzNDY5NA=='
CLIENT_KEY = 'Y2xpZW50X2tleTE1ODE2NDE1MzQ2OTQ='
CLIENT_SECRET = 'Y2xpZW50X3NlY3JldDE1ODE2NDE1MzQ2OTQ='
HOST = 'connector.gigagenie.ai'
PORT = 4080
### COMMON : Client Credentials ###


def getMetadata():
    timestamp = datetime.datetime.now().strftime("%Y%m%d%H%M%S%f")[:-3]
    message = CLIENT_ID + ':' + timestamp
    signature = hmac.new(CLIENT_SECRET, message, hashlib.sha256).hexdigest()
    metadata = [('x-auth-clientkey', CLIENT_KEY),
                ('x-auth-timestamp', timestamp),
                ('x-auth-signature', signature)]
    return metadata


def credentials(context, callback):
    callback(getMetadata(), None)


def getCredentials():
    with open('ca-bundle.pem', 'rb') as f:
        trusted_certs = f.read()
    sslCred = grpc.ssl_channel_credentials(root_certificates=trusted_certs)
    authCred = grpc.metadata_call_credentials(credentials)
    return grpc.composite_channel_credentials(sslCred, authCred)

    ### END OF COMMON ###
# DIALOG : queryByText


def queryByText(text):
    channel = grpc.secure_channel('{}:{}'.format(HOST, PORT), getCredentials())
    stub = gigagenieRPC_pb2_grpc.GigagenieStub(channel)

    message = gigagenieRPC_pb2.reqQueryText()
    message.queryText = text
    message.userSession = "1111"
    message.deviceId = "yourdevice"

    response = stub.queryByText(message)

    print("resultCd: %d" % (response.resultCd))
    if response.resultCd == 200:
        print("uword: %s" % (response.uword))

        print(response)
        #dssAction = response.action
        for a in response.action:
            print(a.mesg)
            print(a.actType)
        # return response.url
    else:
        print("Fail: %d" % (response.resultCd))
        # return None


def main():
    # Dialog : queryByText
    queryByText("라면+먹자")
    #queryByText("\354\235\270\355\204\260\353\204\267 \354\213\240\354\262\255\355\225\230\353\213\244")
    # queryByText("%EC%98%A4%EB%8D%94+%EC%B2%98%EB%A6%AC%EA%B3%A0%EA%B3%A0")


if __name__ == '__main__':
    main()
