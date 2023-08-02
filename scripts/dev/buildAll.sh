cd packages/

cd config/ && docker build -t reddeploy/config:latest -f Dockerfile.dev . && cd ..
cd container-management/ && docker build -t reddeploy/cm:latest . && cd ..
cd system-container-management/ && docker build -t reddeploy/scm:latest . && cd ..
cd web/ && docker build -t reddeploy/web:latest . && cd ..

cd ../

echo "All images built successfully"

exit 0