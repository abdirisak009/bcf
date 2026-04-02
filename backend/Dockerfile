# Build from this directory so context stays small:
#   docker build -t bcf-api .
#
# Prefer `go mod download` over `go mod tidy` in CI/Docker: tidy can pull extra test
# deps and uses more disk in /go/pkg/mod — bad on small VPS disks.

FROM golang:1.22-bookworm AS builder

WORKDIR /app

# Layer cache: only re-download modules when go.mod / go.sum change
COPY go.mod go.sum ./
RUN go mod download

COPY . .

ARG GOOS=linux
ARG GOARCH=amd64
RUN CGO_ENABLED=0 GOOS=${GOOS} GOARCH=${GOARCH} go build -trimpath -ldflags="-s -w" -o /out/app ./cmd

FROM ubuntu:22.04

RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY --from=builder /out/app ./app

EXPOSE 8080

CMD ["./app"]
