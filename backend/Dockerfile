FROM golang:1.22 AS builder

WORKDIR /app
COPY . .

RUN go mod tidy

WORKDIR /app/cmd

RUN go build -o app

FROM ubuntu:22.04

WORKDIR /app
COPY --from=builder /app/cmd/app .

EXPOSE 8080

CMD ["./app"]
