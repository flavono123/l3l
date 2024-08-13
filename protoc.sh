#!/usr/bin/env sh
# server
protoc --proto_path=api/proto --go_out=api/pb --go-grpc_out=api/pb --go_opt=paths=source_relative --go-grpc_opt=paths=source_relative api/proto/label_service.proto
protoc --proto_path=api/proto --go_out=api/pb --go-grpc_out=api/pb --go_opt=paths=source_relative --go-grpc_opt=paths=source_relative api/proto/cluster_info_service.proto

# client
protoc -I=api/proto api/proto/label_service.proto --js_out=import_style=commonjs:./web/src/grpc --grpc-web_out=import_style=typescript,mode=grpcwebtext:./web/src/grpc
protoc -I=api/proto api/proto/cluster_info_service.proto --js_out=import_style=commonjs:./web/src/grpc --grpc-web_out=import_style=typescript,mode=grpcwebtext:./web/src/grpc
