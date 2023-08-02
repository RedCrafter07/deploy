cd packages/

cd config/ && docker build -t reddeploy/config:latest -f Dockerfile.dev . && cd ..
cd container-management/ && docker build -t reddeploy/container-management:latest . && cd ..
cd system-container-management/ && docker build -t reddeploy/system-container-management:latest . && cd ..
cd web/ && docker build -t reddeploy/web:latest . && cd ..

cd ../

echo "All images built successfully"

exit 0